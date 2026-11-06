#!/usr/bin/env python3
"""Send remote-control keys to the Samsung TV.
Usage: ./remote.py KEY_HOME KEY_RIGHT KEY_ENTER ...   (optional: pause=1.5 between keys)
Token is cached in .tv_token after the TV's one-time "Allow" prompt.
"""
import base64, json, os, ssl, sys, time
import websocket

ROOT = os.path.dirname(os.path.abspath(__file__))
TOKEN_FILE = os.path.join(ROOT, ".tv_token")
NAME = base64.b64encode(b"MacRemote").decode()


def read_tv_ip():
    ip = os.environ.get("TV_IP")
    env_file = os.path.join(ROOT, ".env")
    if not ip and os.path.exists(env_file):
        for line in open(env_file):
            if line.startswith("TV_IP="):
                ip = line.split("=", 1)[1].strip().strip('"')
    if not ip:
        sys.exit("Set TV_IP in .env or the environment")
    return ip


TV_IP = read_tv_ip()


def connect():
    token = open(TOKEN_FILE).read().strip() if os.path.exists(TOKEN_FILE) else ""
    url = f"wss://{TV_IP}:8002/api/v2/channels/samsung.remote.control?name={NAME}"
    if token:
        url += f"&token={token}"
    ws = websocket.create_connection(url, sslopt={"cert_reqs": ssl.CERT_NONE}, timeout=40)
    # The TV may send other events (e.g. touchEnable) before the connect acknowledgement.
    for _ in range(5):
        reply = json.loads(ws.recv())
        if reply.get("event") == "ms.channel.connect":
            break
    else:
        sys.exit(f"TV refused connection: {reply}")
    new_token = reply.get("data", {}).get("token")
    if new_token and new_token != token:
        open(TOKEN_FILE, "w").write(new_token)
    return ws


def press(ws, key):
    ws.send(json.dumps({
        "method": "ms.remote.control",
        "params": {"Cmd": "Click", "DataOfCmd": key, "Option": "false", "TypeOfRemote": "SendRemoteKey"},
    }))


def hold(ws, key, seconds=2.0):
    for cmd in ("Press", "Release"):
        if cmd == "Release":
            time.sleep(seconds)
        ws.send(json.dumps({
            "method": "ms.remote.control",
            "params": {"Cmd": cmd, "DataOfCmd": key, "Option": "false", "TypeOfRemote": "SendRemoteKey"},
        }))


if __name__ == "__main__":
    pause = 1.2
    keys = []
    for arg in sys.argv[1:]:
        if arg.startswith("pause="):
            pause = float(arg.split("=", 1)[1])
        else:
            keys.append(arg)
    ws = connect()
    for k in keys:
        if k.startswith("hold:"):
            hold(ws, k[5:])
        else:
            press(ws, k)
        print("sent", k)
        time.sleep(pause)
    ws.close()
