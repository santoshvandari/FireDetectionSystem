def get_system_status(cpu, memory, disk):
    if cpu > 90 or memory > 90 or disk > 95:
        return "Critical"
    elif cpu > 70 or memory > 70 or disk > 80:
        return "Warning"
    return "OK"