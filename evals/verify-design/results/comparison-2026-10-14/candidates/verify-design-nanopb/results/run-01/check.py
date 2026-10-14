"""Bounded offline design checks; no equipment adapter or production implementation."""
import copy
import datetime
import json
import math
from pathlib import Path
import re
import sqlite3
import tempfile
import unittest

ROOT = Path(__file__).resolve().parent
EX = json.loads((ROOT / 'examples.json').read_text(encoding='utf-8'))


def require(condition):
    if not condition:
        raise ValueError('contract violation')


def ident(value, limit=36):
    require(type(value) is str and re.fullmatch(r'[A-Za-z0-9_-]{1,' + str(limit) + '}', value) is not None)


def integer(value, low=0, high=2**53-1):
    require(type(value) is int and low <= value <= high)


def timestamp(value):
    require(type(value) is str and re.fullmatch(r'\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z', value) is not None)
    datetime.datetime.fromisoformat(value.replace('Z', '+00:00'))


def keys(value, names):
    require(type(value) is dict and set(value) == set(names.split()))


def validate(m):
    keys(m, 'schema_version kind sender boot_id seq sent_at payload')
    integer(m['schema_version'], 1, 1)
    require(m['sender'] in ('PC', 'D1', 'D2', 'R1'))
    ident(m['boot_id'])
    integer(m['seq'])
    timestamp(m['sent_at'])
    p = m['payload']
    if m['kind'] == 'COMMAND':
        require(m['sender'] == 'PC')
        require(p['type'] in ('PROCESS', 'TRANSFER'))
        keys(p, 'command_id cycle_id target type' + (' from to' if p['type'] == 'TRANSFER' else ''))
        ident(p['command_id']); ident(p['cycle_id'])
        if p['type'] == 'TRANSFER':
            require((p['target'], p['from'], p['to']) == ('R1', 'D1', 'D2'))
        else:
            require(p['target'] in ('D1', 'D2'))
    elif m['kind'] == 'STATUS':
        keys(p, 'state sensors command_result')
        require(m['sender'] in ('D1', 'D2', 'R1'))
        states = ('IDLE', 'BUSY', 'FAULT') if m['sender'] == 'R1' else ('IDLE', 'PROCESSING', 'READY', 'FAULT')
        require(p['state'] in states)
        keys(p['sensors'], 'part_present door_closed safety_ok')
        require(all(v is None or type(v) is bool for v in p['sensors'].values()))
        if p['command_result'] is not None:
            r = p['command_result']
            keys(r, 'command_id cycle_id phase result_code')
            ident(r['command_id']); ident(r['cycle_id'])
            require(r['phase'] in ('ACK', 'DONE', 'FAILED'))
            if r['result_code'] is not None:
                ident(r['result_code'], 32)
    elif m['kind'] == 'MEASUREMENT':
        keys(p, 'measurements')
        require(m['sender'] in ('D1', 'D2', 'R1'))
        require(type(p['measurements']) is list and len(p['measurements']) <= 8)
        for v in p['measurements']:
            keys(v, 'name value unit measured_at validity')
            require(v['name'] == 'temperature' and v['unit'] == 'degC')
            timestamp(v['measured_at'])
            require(v['validity'] in ('VALID', 'INVALID', 'UNKNOWN'))
            if v['validity'] == 'VALID':
                require(type(v['value']) in (int, float) and math.isfinite(v['value']) and 0 <= v['value'] <= 100)
            else:
                require(v['value'] is None)
    elif m['kind'] == 'CONFIG':
        keys(p, 'revision heartbeat_ms offline_ms ack_ms done_timeout_ms retention_days')
        require(m['sender'] == 'PC')
        integer(p['revision'], 1, 2**31-1)
        for name, value in [('heartbeat_ms', 1000), ('offline_ms', 3000), ('ack_ms', 2000)]:
            integer(p[name], value, value)
        for name in ('done_timeout_ms', 'retention_days'):
            if p[name] is not None:
                integer(p[name], 1, 2**31-1)
    elif m['kind'] == 'AUDIT':
        keys(p, 'event_id actor_id role action outcome reason')
        require(m['sender'] == 'PC')
        ident(p['event_id']); ident(p['actor_id'], 64); ident(p['action'], 32)
        require(p['role'] in ('OPERATOR', 'MAINTENANCE', 'SYSTEM'))
        require(p['outcome'] in ('ALLOWED', 'DENIED', 'ERROR'))
        require(type(p['reason']) is str and len(p['reason'].encode('utf-8')) <= 256)
    else:
        raise ValueError('unknown kind')
    return m


def pairs(items):
    d = {}
    for k, v in items:
        require(k not in d)
        d[k] = v
    return d


def decode(frame):
    require(len(frame) >= 4)
    n = int.from_bytes(frame[:4], 'big')
    require(1 <= n <= 4096 and len(frame) == n + 4)
    return validate(json.loads(frame[4:].decode('utf-8'), object_pairs_hook=pairs,
                               parse_constant=lambda x: require(False)))


def frame(m):
    raw = json.dumps(m, ensure_ascii=False, allow_nan=False).encode('utf-8')
    return len(raw).to_bytes(4, 'big') + raw


def accept_status(current, incoming):
    validate(incoming)
    require(incoming['kind'] == 'STATUS')
    if (current['sender'], current['boot_id']) != (incoming['sender'], incoming['boot_id']):
        return current, 'RECONCILE'
    if incoming['seq'] <= current['seq']:
        return current, 'IGNORED'
    return incoming, 'APPLIED'


class Checks(unittest.TestCase):
    def bad(self, name, mutate):
        m = copy.deepcopy(EX[name]); mutate(m)
        with self.assertRaises((ValueError, KeyError, TypeError)):
            decode(frame(m))

    def test_01_five_valid_examples(self):
        for m in EX.values():
            self.assertEqual(decode(frame(m)), m)

    def test_02_required_command(self):
        self.bad('command', lambda m: m['payload'].pop('command_id'))

    def test_03_id_length(self):
        self.bad('command', lambda m: m['payload'].update(command_id='x'*37))

    def test_04_version_and_bool(self):
        for value in (2, True):
            self.bad('status', lambda m: m.update(schema_version=value))

    def test_05_sequence_bounds(self):
        for value in (-1, 2**53, True):
            self.bad('status', lambda m: m.update(seq=value))

    def test_06_measurement_constraints(self):
        for changes in ({'value':101}, {'unit':'C'}, {'validity':'INVALID'}, {'measured_at':'2026-99-01T00:00:00.000Z'}):
            self.bad('measurement', lambda m: m['payload']['measurements'][0].update(changes))
        self.bad('measurement', lambda m: m['payload'].update(measurements=m['payload']['measurements']*9))

    def test_07_utf8_length(self):
        self.bad('audit', lambda m: m['payload'].update(reason='가'*86))

    def test_08_frame_errors(self):
        for raw in (b'{"schema_version":1,"schema_version":1}', b'{"x":NaN}', b'\xff', b'x'*4097):
            with self.assertRaises(ValueError):
                decode(len(raw).to_bytes(4, 'big') + raw)
        with self.assertRaises(ValueError):
            decode(frame(EX['command'])[:-1])

    def test_09_state_and_unknown_field(self):
        self.bad('status', lambda m: m['payload'].update(state='BUSY'))
        self.bad('status', lambda m: m.update(extra=1))

    def test_10_order_and_new_boot(self):
        original = EX['status']
        for seq in (9, 10, 11):
            incoming = copy.deepcopy(original); incoming['seq'] = seq
            current, result = accept_status(original, incoming)
            self.assertEqual(current['seq'], max(10, seq))
            self.assertEqual(result, 'APPLIED' if seq == 11 else 'IGNORED')
        incoming['boot_id'] = 'd1-2'
        self.assertEqual(accept_status(original, incoming), (original, 'RECONCILE'))

    def test_11_storage_constraints_rollback_restart(self):
        with tempfile.TemporaryDirectory(dir=ROOT) as directory:
            path = Path(directory) / 'fixture.db'
            db = sqlite3.connect(path)
            db.executescript((ROOT / 'schema.sql').read_text(encoding='utf-8'))
            with db:
                db.execute("INSERT INTO cycles VALUES ('cycle-1','TRANSFER')")
                db.execute('INSERT INTO commands VALUES (?,?,?,?)', ('cmd-1','cycle-1',json.dumps(EX['command']['payload'],sort_keys=True),'REQUESTED'))
                db.execute("INSERT INTO reservations VALUES ('R1','cmd-1')")
            for sql in ("INSERT INTO commands VALUES ('cmd-1','cycle-1','{}','REQUESTED')",
                        "INSERT INTO commands VALUES ('orphan','missing','{}','REQUESTED')",
                        "UPDATE commands SET phase='bogus' WHERE id='cmd-1'"):
                with self.assertRaises(sqlite3.IntegrityError):
                    with db:
                        db.execute(sql)
            with self.assertRaises(sqlite3.IntegrityError):
                with db:
                    db.execute("INSERT INTO commands VALUES ('cmd-2','cycle-1','{}','REQUESTED')")
                    db.execute("INSERT INTO reservations VALUES ('R1','cmd-2')")
            self.assertEqual(db.execute('SELECT count(*) FROM commands').fetchone()[0], 1)
            self.assertEqual(db.execute('SELECT command_id FROM reservations').fetchone()[0], 'cmd-1')
            db.close()
            db = sqlite3.connect(path)
            self.assertEqual(db.execute('SELECT phase FROM commands').fetchone()[0], 'REQUESTED')
            with db:
                db.execute("UPDATE commands SET phase='UNKNOWN' WHERE phase IN ('REQUESTED','ACK')")
            self.assertEqual(db.execute('SELECT phase FROM commands').fetchone()[0], 'UNKNOWN')
            db.close()


if __name__ == '__main__':
    unittest.main(verbosity=2)
