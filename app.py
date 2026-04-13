from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

def get_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="mimit_hms"
    )

@app.route("/")
def home():
    return "MIMIT HMS Backend Connected"

@app.route("/dashboard_stats", methods=["GET"])
def get_dashboard_stats():
    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT COUNT(*) as total_students FROM students")
    total_students = cursor.fetchone()["total_students"]

    cursor.execute("SELECT COUNT(*) as total_rooms FROM rooms")
    total_rooms = cursor.fetchone()["total_rooms"]

    cursor.execute("SELECT COUNT(*) as pending_complaints FROM complaints WHERE status = 'Pending'")
    pending_complaints = cursor.fetchone()["pending_complaints"]

    cursor.execute("SELECT COUNT(*) as pending_visitors FROM visitors")
    total_visitors = cursor.fetchone()["pending_visitors"]

    cursor.close()
    db.close()
    return jsonify({
        "total_students": total_students,
        "total_rooms": total_rooms,
        "pending_complaints": pending_complaints,
        "total_visitors": total_visitors
    })

@app.route("/parents", methods=["GET"])
def get_parents():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT p.parent_id, p.user_id, p.name, p.phone, u.username
        FROM parents p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.parent_id ASC
    """)
    parents = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(parents)

@app.route("/parents/add", methods=["POST"])
def add_parent():
    data = request.json
    name = data.get("name")
    phone = data.get("phone")
    username = data.get("username")
    password = data.get("password")

    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT id FROM users WHERE username=%s", (username,))
    existing = cursor.fetchone()
    if existing:
        cursor.close()
        db.close()
        return jsonify({"status": "fail", "message": "Username already exists"})

    insert_cursor = db.cursor()
    insert_cursor.execute(
        "INSERT INTO users (username, password, role) VALUES (%s, %s, %s)",
        (username, password, "parent")
    )
    user_id = insert_cursor.lastrowid
    insert_cursor.execute(
        "INSERT INTO parents (user_id, name, phone) VALUES (%s, %s, %s)",
        (user_id, name, phone)
    )
    parent_id = insert_cursor.lastrowid
    db.commit()
    insert_cursor.close()
    cursor.close()
    db.close()
    return jsonify({"status": "success", "parent_id": parent_id, "user_id": user_id})

@app.route("/parents/edit/<int:parent_id>", methods=["PUT"])
def edit_parent(parent_id):
    data = request.json
    name = data.get("name")
    phone = data.get("phone")

    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "UPDATE parents SET name=%s, phone=%s WHERE parent_id=%s",
        (name, phone, parent_id)
    )
    db.commit()
    cursor.close()
    db.close()
    return jsonify({"status": "success"})

@app.route("/parents/delete/<int:parent_id>", methods=["DELETE"])
def delete_parent(parent_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT user_id FROM parents WHERE parent_id=%s", (parent_id,))
    parent = cursor.fetchone()

    if parent:
        update_cursor = db.cursor()
        update_cursor.execute(
            "UPDATE students SET parent_id=NULL WHERE parent_id=%s",
            (parent["user_id"],)
        )
        update_cursor.execute("DELETE FROM parents WHERE parent_id=%s", (parent_id,))
        update_cursor.execute("DELETE FROM users WHERE id=%s", (parent["user_id"],))
        db.commit()
        update_cursor.close()

    cursor.close()
    db.close()
    return jsonify({"status": "success"})

@app.route("/students", methods=["GET"])
def get_students():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT s.student_id, s.user_id, s.parent_id, s.name, s.course, s.semester, s.room_type,
               p.name as parent_name, u.username as student_username,
               r.room_number
        FROM students s
        LEFT JOIN parents p ON s.parent_id = p.user_id
        LEFT JOIN users u ON s.user_id = u.id
        LEFT JOIN room_allotment ra ON s.student_id = ra.student_id
            AND ra.status = 'active'
        LEFT JOIN rooms r ON ra.room_id = r.room_id
    """)
    students = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(students)

@app.route("/students/add", methods=["POST"])
def add_student():
    data = request.json
    name = data.get("name")
    course = data.get("course")
    semester = data.get("semester")
    room_type = data.get("room_type")
    parent_id = data.get("parent_id")
    username = data.get("username")
    password = data.get("password")

    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT id FROM users WHERE username=%s", (username,))
    existing = cursor.fetchone()
    if existing:
        cursor.close()
        db.close()
        return jsonify({"status": "fail", "message": "Student username already exists"})

    insert_cursor = db.cursor()
    insert_cursor.execute(
        "INSERT INTO users (username, password, role) VALUES (%s, %s, %s)",
        (username, password, "student")
    )
    user_id = insert_cursor.lastrowid
    insert_cursor.execute(
        "INSERT INTO students (user_id, name, course, semester, room_type, parent_id) VALUES (%s, %s, %s, %s, %s, %s)",
        (user_id, name, course, semester, room_type, parent_id)
    )
    db.commit()
    insert_cursor.close()
    cursor.close()
    db.close()
    return jsonify({"status": "success"})

@app.route("/students/edit/<int:student_id>", methods=["PUT"])
def edit_student(student_id):
    data = request.json
    name = data.get("name")
    course = data.get("course")
    semester = data.get("semester")
    room_type = data.get("room_type")
    parent_id = data.get("parent_id")

    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "UPDATE students SET name=%s, course=%s, semester=%s, room_type=%s, parent_id=%s WHERE student_id=%s",
        (name, course, semester, room_type, parent_id, student_id)
    )
    db.commit()
    cursor.close()
    db.close()
    return jsonify({"status": "success"})

@app.route("/students/delete/<int:student_id>", methods=["DELETE"])
def delete_student(student_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT user_id FROM students WHERE student_id=%s", (student_id,))
    student = cursor.fetchone()
    delete_cursor = db.cursor()
    delete_cursor.execute("DELETE FROM students WHERE student_id=%s", (student_id,))
    if student:
        delete_cursor.execute("DELETE FROM users WHERE id=%s", (student["user_id"],))
    db.commit()
    delete_cursor.close()
    cursor.close()
    db.close()
    return jsonify({"status": "success"})

@app.route("/rooms", methods=["GET"])
def get_rooms():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT r.room_id, r.room_number, r.room_type, r.capacity,
               GROUP_CONCAT(DISTINCT s.name SEPARATOR ', ') as allotted_students,
               COUNT(DISTINCT ra.student_id) as occupied_count
        FROM rooms r
        LEFT JOIN room_allotment ra ON r.room_id = ra.room_id
            AND ra.status = 'active'
        LEFT JOIN students s ON ra.student_id = s.student_id
        GROUP BY r.room_id
    """)
    rooms = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(rooms)

@app.route("/rooms/add", methods=["POST"])
def add_room():
    data = request.json
    room_number = data.get("room_number")
    room_type = data.get("room_type")
    capacity = data.get("capacity")

    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO rooms (room_number, room_type, capacity) VALUES (%s, %s, %s)",
        (room_number, room_type, capacity)
    )
    db.commit()
    cursor.close()
    db.close()
    return jsonify({"status": "success"})

@app.route("/rooms/edit/<int:room_id>", methods=["PUT"])
def edit_room(room_id):
    data = request.json
    room_number = data.get("room_number")
    room_type = data.get("room_type")
    capacity = data.get("capacity")

    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "UPDATE rooms SET room_number=%s, room_type=%s, capacity=%s WHERE room_id=%s",
        (room_number, room_type, capacity, room_id)
    )
    db.commit()
    cursor.close()
    db.close()
    return jsonify({"status": "success"})

@app.route("/rooms/delete/<int:room_id>", methods=["DELETE"])
def delete_room(room_id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("DELETE FROM rooms WHERE room_id=%s", (room_id,))
    db.commit()
    cursor.close()
    db.close()
    return jsonify({"status": "success"})

@app.route("/room_allotment", methods=["GET"])
def get_room_allotments():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT ra.allotment_id, ra.student_id, ra.room_id, ra.allotment_date, ra.status,
               s.name as student_name, s.room_type as preferred_room_type,
               r.room_number, r.room_type, r.capacity
        FROM room_allotment ra
        JOIN students s ON ra.student_id = s.student_id
        JOIN rooms r ON ra.room_id = r.room_id
        WHERE ra.status = 'active'
        ORDER BY r.room_number ASC, s.name ASC
    """)
    allotments = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(allotments)

@app.route("/room_allotment/add", methods=["POST"])
def add_room_allotment():
    data = request.json
    student_id = data.get("student_id")
    room_id = data.get("room_id")
    allotment_date = data.get("allotment_date")

    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT room_type, capacity FROM rooms WHERE room_id=%s", (room_id,))
    room = cursor.fetchone()
    if not room:
        cursor.close()
        db.close()
        return jsonify({"status": "fail", "message": "Room not found"})

    cursor.execute("SELECT room_type FROM students WHERE student_id=%s", (student_id,))
    student = cursor.fetchone()
    if not student:
        cursor.close()
        db.close()
        return jsonify({"status": "fail", "message": "Student not found"})

    if student["room_type"] != room["room_type"]:
        cursor.close()
        db.close()
        return jsonify({"status": "fail", "message": "Student room type does not match this room"})

    cursor.execute(
        "SELECT COUNT(*) as total FROM room_allotment WHERE room_id=%s AND status='active'",
        (room_id,)
    )
    occupied = cursor.fetchone()["total"]
    if occupied >= room["capacity"]:
        cursor.close()
        db.close()
        return jsonify({"status": "fail", "message": "Room is already full"})

    update_cursor = db.cursor()
    update_cursor.execute(
        "UPDATE room_allotment SET status='inactive' WHERE student_id=%s AND status='active'",
        (student_id,)
    )
    update_cursor.execute(
        "INSERT INTO room_allotment (student_id, room_id, allotment_date, status) VALUES (%s, %s, %s, %s)",
        (student_id, room_id, allotment_date, "active")
    )

    db.commit()
    update_cursor.close()
    cursor.close()
    db.close()
    return jsonify({"status": "success"})

@app.route("/room_allotment/delete/<int:allotment_id>", methods=["DELETE"])
def delete_room_allotment(allotment_id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "UPDATE room_allotment SET status='inactive' WHERE allotment_id=%s",
        (allotment_id,)
    )
    db.commit()
    cursor.close()
    db.close()
    return jsonify({"status": "success"})

@app.route("/room_cleaning", methods=["GET"])
def get_room_cleaning():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT rc.cleaning_id, rc.student_id, rc.room_id, s.name as student_name, r.room_number,
               rc.cleaning_date, rc.status, rc.remarks
        FROM room_cleaning rc
        JOIN students s ON rc.student_id = s.student_id
        JOIN rooms r ON rc.room_id = r.room_id
        JOIN (
            SELECT student_id, MAX(cleaning_id) as latest_cleaning_id
            FROM room_cleaning
            GROUP BY student_id
        ) latest ON latest.latest_cleaning_id = rc.cleaning_id
        ORDER BY rc.cleaning_date DESC, s.name ASC
    """)
    cleaning = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(cleaning)

@app.route("/student_room_cleaning/<int:user_id>", methods=["GET"])
def get_student_room_cleaning(user_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT s.student_id, s.name, r.room_id, r.room_number
        FROM students s
        LEFT JOIN room_allotment ra ON s.student_id = ra.student_id AND ra.status='active'
        LEFT JOIN rooms r ON ra.room_id = r.room_id
        WHERE s.user_id=%s
    """, (user_id,))
    student = cursor.fetchone()

    if not student:
        cursor.close()
        db.close()
        return jsonify({"student": None, "records": []})

    cursor.execute("""
        SELECT cleaning_id, cleaning_date, status, remarks
        FROM room_cleaning
        WHERE student_id=%s
        ORDER BY cleaning_date DESC, cleaning_id DESC
    """, (student["student_id"],))
    records = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify({"student": student, "records": records})

@app.route("/student_room_cleaning/update/<int:user_id>", methods=["POST"])
def update_student_room_cleaning(user_id):
    data = request.json
    cleaning_date = data.get("cleaning_date")
    status = data.get("status")
    remarks = data.get("remarks")

    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT s.student_id, r.room_id
        FROM students s
        LEFT JOIN room_allotment ra ON s.student_id = ra.student_id AND ra.status='active'
        LEFT JOIN rooms r ON ra.room_id = r.room_id
        WHERE s.user_id=%s
    """, (user_id,))
    student = cursor.fetchone()

    if not student or not student["room_id"]:
        cursor.close()
        db.close()
        return jsonify({"status": "fail", "message": "No active room allotted"}), 400

    cursor.execute(
        "SELECT cleaning_id FROM room_cleaning WHERE student_id=%s AND cleaning_date=%s",
        (student["student_id"], cleaning_date)
    )
    existing = cursor.fetchone()

    write_cursor = db.cursor()
    if existing:
        write_cursor.execute(
            "UPDATE room_cleaning SET room_id=%s, status=%s, remarks=%s WHERE cleaning_id=%s",
            (student["room_id"], status, remarks, existing["cleaning_id"])
        )
    else:
        write_cursor.execute(
            "INSERT INTO room_cleaning (student_id, room_id, cleaning_date, status, remarks) VALUES (%s, %s, %s, %s, %s)",
            (student["student_id"], student["room_id"], cleaning_date, status, remarks)
        )

    db.commit()
    write_cursor.close()
    cursor.close()
    db.close()
    return jsonify({"status": "success"})

@app.route("/room_cleaning/add", methods=["POST"])
def add_room_cleaning():
    data = request.json
    student_id = data.get("student_id")
    room_id = data.get("room_id")
    cleaning_date = data.get("cleaning_date")
    status = data.get("status")
    remarks = data.get("remarks")

    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO room_cleaning (student_id, room_id, cleaning_date, status, remarks) VALUES (%s, %s, %s, %s, %s)",
        (student_id, room_id, cleaning_date, status, remarks)
    )
    db.commit()
    cursor.close()
    db.close()
    return jsonify({"status": "success"})

@app.route("/room_cleaning/edit/<int:cleaning_id>", methods=["PUT"])
def edit_room_cleaning(cleaning_id):
    data = request.json
    cleaning_date = data.get("cleaning_date")
    status = data.get("status")
    remarks = data.get("remarks")

    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "UPDATE room_cleaning SET cleaning_date=%s, status=%s, remarks=%s WHERE cleaning_id=%s",
        (cleaning_date, status, remarks, cleaning_id)
    )
    db.commit()
    cursor.close()
    db.close()
    return jsonify({"status": "success"})

@app.route("/room_cleaning/delete/<int:cleaning_id>", methods=["DELETE"])
def delete_room_cleaning(cleaning_id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("DELETE FROM room_cleaning WHERE cleaning_id=%s", (cleaning_id,))
    db.commit()
    cursor.close()
    db.close()
    return jsonify({"status": "success"})

@app.route("/visitors", methods=["GET"])
def get_visitors():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT v.visitor_id, v.student_id, s.name as student_name,
               v.visitor_name, v.relation, v.visit_date, v.in_time, v.out_time
        FROM visitors v
        JOIN students s ON v.student_id = s.student_id
        ORDER BY v.visit_date DESC, v.visitor_id DESC
    """)
    visitors = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(visitors)

@app.route("/visitors/add", methods=["POST"])
def add_visitor():
    data = request.json
    student_id = data.get("student_id")
    visitor_name = data.get("visitor_name")
    relation = data.get("relation")
    visit_date = data.get("visit_date")
    in_time = data.get("in_time")
    out_time = data.get("out_time")

    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO visitors (student_id, visitor_name, relation, visit_date, in_time, out_time) VALUES (%s, %s, %s, %s, %s, %s)",
        (student_id, visitor_name, relation, visit_date, in_time, out_time)
    )
    db.commit()
    cursor.close()
    db.close()
    return jsonify({"status": "success"})

@app.route("/visitors/edit/<int:visitor_id>", methods=["PUT"])
def edit_visitor(visitor_id):
    data = request.json
    visitor_name = data.get("visitor_name")
    relation = data.get("relation")
    visit_date = data.get("visit_date")
    in_time = data.get("in_time")
    out_time = data.get("out_time")

    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "UPDATE visitors SET visitor_name=%s, relation=%s, visit_date=%s, in_time=%s, out_time=%s WHERE visitor_id=%s",
        (visitor_name, relation, visit_date, in_time, out_time, visitor_id)
    )
    db.commit()
    cursor.close()
    db.close()
    return jsonify({"status": "success"})

@app.route("/visitors/delete/<int:visitor_id>", methods=["DELETE"])
def delete_visitor(visitor_id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("DELETE FROM visitors WHERE visitor_id=%s", (visitor_id,))
    db.commit()
    cursor.close()
    db.close()
    return jsonify({"status": "success"})

@app.route("/outing", methods=["GET"])
def get_outing():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT o.outing_id, o.student_id, s.name as student_name, o.reason,
               o.outing_date, o.out_time, o.in_time, o.parent_status, o.warden_status
        FROM outing o
        JOIN students s ON o.student_id = s.student_id
        ORDER BY o.outing_date DESC, o.outing_id DESC
    """)
    outings = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(outings)

@app.route("/outing/warden/<int:outing_id>", methods=["PUT"])
def update_warden_outing(outing_id):
    data = request.json
    warden_status = data.get("warden_status")

    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        "SELECT parent_status FROM outing WHERE outing_id=%s",
        (outing_id,)
    )
    outing = cursor.fetchone()
    if not outing:
        cursor.close()
        db.close()
        return jsonify({"status": "fail", "message": "Outing request not found"}), 404

    if outing["parent_status"] != "Approved":
        cursor.close()
        db.close()
        return jsonify({"status": "fail", "message": "Parent approval is required first"}), 400

    write_cursor = db.cursor()
    write_cursor.execute(
        "UPDATE outing SET warden_status=%s WHERE outing_id=%s",
        (warden_status, outing_id)
    )
    db.commit()
    write_cursor.close()
    cursor.close()
    db.close()
    return jsonify({"status": "success"})

@app.route("/outing/add", methods=["POST"])
def add_outing():
    data = request.json
    student_id = data.get("student_id")
    reason = data.get("reason")
    outing_date = data.get("outing_date")
    out_time = data.get("out_time")
    in_time = data.get("in_time")
    parent_status = data.get("parent_status")
    warden_status = data.get("warden_status")

    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO outing (student_id, reason, outing_date, out_time, in_time, parent_status, warden_status) VALUES (%s, %s, %s, %s, %s, %s, %s)",
        (student_id, reason, outing_date, out_time, in_time, parent_status, warden_status)
    )
    db.commit()
    cursor.close()
    db.close()
    return jsonify({"status": "success"})

@app.route("/outing/edit/<int:outing_id>", methods=["PUT"])
def edit_outing(outing_id):
    data = request.json
    reason = data.get("reason")
    outing_date = data.get("outing_date")
    out_time = data.get("out_time")
    in_time = data.get("in_time")
    parent_status = data.get("parent_status")
    warden_status = data.get("warden_status")

    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "UPDATE outing SET reason=%s, outing_date=%s, out_time=%s, in_time=%s, parent_status=%s, warden_status=%s WHERE outing_id=%s",
        (reason, outing_date, out_time, in_time, parent_status, warden_status, outing_id)
    )
    db.commit()
    cursor.close()
    db.close()
    return jsonify({"status": "success"})

@app.route("/outing/delete/<int:outing_id>", methods=["DELETE"])
def delete_outing(outing_id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("DELETE FROM outing WHERE outing_id=%s", (outing_id,))
    db.commit()
    cursor.close()
    db.close()
    return jsonify({"status": "success"})

@app.route("/leave_requests", methods=["GET"])
def get_leave_requests():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT l.leave_id, l.student_id, s.name as student_name, l.reason,
               l.start_date, l.end_date, l.parent_status, l.warden_status,
               l.applied_on, l.remarks
        FROM leave_requests l
        JOIN students s ON l.student_id = s.student_id
        ORDER BY l.applied_on DESC, l.leave_id DESC
    """)
    leaves = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(leaves)

@app.route("/leave_requests/warden/<int:leave_id>", methods=["PUT"])
def update_warden_leave(leave_id):
    data = request.json
    warden_status = data.get("warden_status")

    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        "SELECT parent_status FROM leave_requests WHERE leave_id=%s",
        (leave_id,)
    )
    leave_request = cursor.fetchone()
    if not leave_request:
        cursor.close()
        db.close()
        return jsonify({"status": "fail", "message": "Leave request not found"}), 404

    if leave_request["parent_status"] != "Approved":
        cursor.close()
        db.close()
        return jsonify({"status": "fail", "message": "Parent approval is required first"}), 400

    write_cursor = db.cursor()
    write_cursor.execute(
        "UPDATE leave_requests SET warden_status=%s WHERE leave_id=%s",
        (warden_status, leave_id)
    )
    db.commit()
    write_cursor.close()
    cursor.close()
    db.close()
    return jsonify({"status": "success"})

@app.route("/leave_requests/add", methods=["POST"])
def add_leave_request():
    data = request.json
    student_id = data.get("student_id")
    reason = data.get("reason")
    start_date = data.get("start_date")
    end_date = data.get("end_date")
    parent_status = data.get("parent_status")
    warden_status = data.get("warden_status")
    applied_on = data.get("applied_on")
    remarks = data.get("remarks")

    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO leave_requests (student_id, reason, start_date, end_date, parent_status, warden_status, applied_on, remarks) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
        (student_id, reason, start_date, end_date, parent_status, warden_status, applied_on, remarks)
    )
    db.commit()
    cursor.close()
    db.close()
    return jsonify({"status": "success"})

@app.route("/leave_requests/edit/<int:leave_id>", methods=["PUT"])
def edit_leave_request(leave_id):
    data = request.json
    reason = data.get("reason")
    start_date = data.get("start_date")
    end_date = data.get("end_date")
    parent_status = data.get("parent_status")
    warden_status = data.get("warden_status")
    applied_on = data.get("applied_on")
    remarks = data.get("remarks")

    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "UPDATE leave_requests SET reason=%s, start_date=%s, end_date=%s, parent_status=%s, warden_status=%s, applied_on=%s, remarks=%s WHERE leave_id=%s",
        (reason, start_date, end_date, parent_status, warden_status, applied_on, remarks, leave_id)
    )
    db.commit()
    cursor.close()
    db.close()
    return jsonify({"status": "success"})

@app.route("/leave_requests/delete/<int:leave_id>", methods=["DELETE"])
def delete_leave_request(leave_id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("DELETE FROM leave_requests WHERE leave_id=%s", (leave_id,))
    db.commit()
    cursor.close()
    db.close()
    return jsonify({"status": "success"})

@app.route("/mess_bill", methods=["GET"])
def get_mess_bills():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT mb.mess_bill_id, mb.student_id, s.name, s.course, s.semester,
               mb.month, mb.amount, mb.status
        FROM mess_bill mb
        JOIN students s ON mb.student_id = s.student_id
        ORDER BY mb.mess_bill_id DESC
    """)
    bills = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(bills)

@app.route("/mess_bill/add", methods=["POST"])
def add_mess_bill():
    data = request.json
    student_id = data.get("student_id")
    month = data.get("month")
    amount = data.get("amount")
    status = data.get("status")

    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO mess_bill (student_id, month, amount, status) VALUES (%s, %s, %s, %s)",
        (student_id, month, amount, status)
    )
    db.commit()
    cursor.close()
    db.close()
    return jsonify({"status": "success"})

@app.route("/mess_bill/edit/<int:mess_bill_id>", methods=["PUT"])
def edit_mess_bill(mess_bill_id):
    data = request.json
    month = data.get("month")
    amount = data.get("amount")
    status = data.get("status")

    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "UPDATE mess_bill SET month=%s, amount=%s, status=%s WHERE mess_bill_id=%s",
        (month, amount, status, mess_bill_id)
    )
    db.commit()
    cursor.close()
    db.close()
    return jsonify({"status": "success"})

@app.route("/mess_bill/delete/<int:mess_bill_id>", methods=["DELETE"])
def delete_mess_bill(mess_bill_id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("DELETE FROM mess_bill WHERE mess_bill_id=%s", (mess_bill_id,))
    db.commit()
    cursor.close()
    db.close()
    return jsonify({"status": "success"})

@app.route("/complaints", methods=["GET"])
def get_complaints():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT c.complaint_id, c.student_id, c.room_id, c.complaint_text, c.status, c.complaint_date,
               s.name as student_name, r.room_number
        FROM complaints c
        JOIN students s ON c.student_id = s.student_id
        JOIN rooms r ON c.room_id = r.room_id
        ORDER BY c.complaint_date DESC, c.complaint_id DESC
    """)
    complaints = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(complaints)

@app.route("/complaints/add", methods=["POST"])
def add_complaint():
    data = request.json
    student_id = data.get("student_id")
    room_id = data.get("room_id")
    complaint_text = data.get("complaint_text")
    status = data.get("status")
    complaint_date = data.get("complaint_date")

    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO complaints (student_id, room_id, complaint_text, status, complaint_date) VALUES (%s, %s, %s, %s, %s)",
        (student_id, room_id, complaint_text, status, complaint_date)
    )
    db.commit()
    cursor.close()
    db.close()
    return jsonify({"status": "success"})

@app.route("/complaints/edit/<int:complaint_id>", methods=["PUT"])
def edit_complaint(complaint_id):
    data = request.json
    status = data.get("status")

    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "UPDATE complaints SET status=%s WHERE complaint_id=%s",
        (status, complaint_id)
    )
    db.commit()
    cursor.close()
    db.close()
    return jsonify({"status": "success"})

@app.route("/complaints/delete/<int:complaint_id>", methods=["DELETE"])
def delete_complaint(complaint_id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("DELETE FROM complaints WHERE complaint_id=%s", (complaint_id,))
    db.commit()
    cursor.close()
    db.close()
    return jsonify({"status": "success"})

@app.route("/announcements", methods=["GET"])
def get_announcements():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT announcement_id, user_id, title, message, role, created_at
        FROM announcements
        ORDER BY created_at DESC, announcement_id DESC
    """)
    announcements = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(announcements)

@app.route("/announcements/add", methods=["POST"])
def add_announcement():
    data = request.json
    user_id = data.get("user_id")
    title = data.get("title")
    message = data.get("message")
    role = data.get("role")

    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO announcements (user_id, title, message, role) VALUES (%s, %s, %s, %s)",
        (user_id, title, message, role)
    )
    db.commit()
    cursor.close()
    db.close()
    return jsonify({"status": "success"})

@app.route("/announcements/edit/<int:announcement_id>", methods=["PUT"])
def edit_announcement(announcement_id):
    data = request.json
    title = data.get("title")
    message = data.get("message")
    role = data.get("role")

    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "UPDATE announcements SET title=%s, message=%s, role=%s WHERE announcement_id=%s",
        (title, message, role, announcement_id)
    )
    db.commit()
    cursor.close()
    db.close()
    return jsonify({"status": "success"})

@app.route("/announcements/delete/<int:announcement_id>", methods=["DELETE"])
def delete_announcement(announcement_id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("DELETE FROM announcements WHERE announcement_id=%s", (announcement_id,))
    db.commit()
    cursor.close()
    db.close()
    return jsonify({"status": "success"})

@app.route("/attendance", methods=["GET"])
def get_attendance():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT a.attendance_id, a.student_id, s.name, s.course, s.semester,
               a.date, a.status, a.marked_by
        FROM attendance a
        JOIN students s ON a.student_id = s.student_id
        ORDER BY a.date DESC, s.name ASC
    """)
    attendance = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(attendance)

@app.route("/attendance/add", methods=["POST"])
def add_attendance():
    data = request.json
    student_id = data.get("student_id")
    date = data.get("date")
    status = data.get("status")
    marked_by = data.get("marked_by", "Warden")

    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        "SELECT attendance_id FROM attendance WHERE student_id=%s AND date=%s",
        (student_id, date)
    )
    existing = cursor.fetchone()

    if existing:
        cursor = db.cursor()
        cursor.execute(
            "UPDATE attendance SET status=%s, marked_by=%s WHERE attendance_id=%s",
            (status, marked_by, existing["attendance_id"])
        )
    else:
        cursor = db.cursor()
        cursor.execute(
            "INSERT INTO attendance (student_id, date, status, marked_by) VALUES (%s, %s, %s, %s)",
            (student_id, date, status, marked_by)
        )

    db.commit()
    cursor.close()
    db.close()
    return jsonify({"status": "success"})

@app.route("/attendance/edit/<int:attendance_id>", methods=["PUT"])
def edit_attendance(attendance_id):
    data = request.json
    date = data.get("date")
    status = data.get("status")
    marked_by = data.get("marked_by")

    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "UPDATE attendance SET date=%s, status=%s, marked_by=%s WHERE attendance_id=%s",
        (date, status, marked_by, attendance_id)
    )
    db.commit()
    cursor.close()
    db.close()
    return jsonify({"status": "success"})

@app.route("/attendance/delete/<int:attendance_id>", methods=["DELETE"])
def delete_attendance(attendance_id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("DELETE FROM attendance WHERE attendance_id=%s", (attendance_id,))
    db.commit()
    cursor.close()
    db.close()
    return jsonify({"status": "success"})

@app.route("/student_dashboard/<int:user_id>", methods=["GET"])
def get_student_dashboard(user_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        SELECT s.student_id, s.name, s.course, s.semester, s.room_type,
               r.room_number
        FROM students s
        LEFT JOIN room_allotment ra ON s.student_id = ra.student_id AND ra.status='active'
        LEFT JOIN rooms r ON ra.room_id = r.room_id
        WHERE s.user_id=%s
    """, (user_id,))
    student = cursor.fetchone()

    if not student:
        cursor.close()
        db.close()
        return jsonify({"status": "fail", "message": "Student not found"}), 404

    cursor.execute(
        "SELECT COUNT(*) as total, SUM(CASE WHEN status='Present' THEN 1 ELSE 0 END) as present_count FROM attendance WHERE student_id=%s",
        (student["student_id"],)
    )
    attendance_stats = cursor.fetchone()
    total = attendance_stats["total"] or 0
    present_count = attendance_stats["present_count"] or 0
    attendance_percentage = round((present_count / total) * 100, 1) if total else 0

    cursor.execute(
        "SELECT COUNT(*) as pending_bills FROM mess_bill WHERE student_id=%s AND status!='Paid'",
        (student["student_id"],)
    )
    pending_bills = cursor.fetchone()["pending_bills"]

    cursor.close()
    db.close()
    return jsonify({
        "student": student,
        "attendance_percentage": attendance_percentage,
        "pending_bills": pending_bills
    })

@app.route("/student_attendance/<int:user_id>", methods=["GET"])
def get_student_attendance(user_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT student_id FROM students WHERE user_id=%s", (user_id,))
    student = cursor.fetchone()
    if not student:
        cursor.close()
        db.close()
        return jsonify([])

    cursor.execute("""
        SELECT attendance_id, date, status, marked_by
        FROM attendance
        WHERE student_id=%s
        ORDER BY date DESC
    """, (student["student_id"],))
    rows = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(rows)

@app.route("/student_mess_bill/<int:user_id>", methods=["GET"])
def get_student_mess_bill(user_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT student_id FROM students WHERE user_id=%s", (user_id,))
    student = cursor.fetchone()
    if not student:
        cursor.close()
        db.close()
        return jsonify([])

    cursor.execute("""
        SELECT mess_bill_id, month, amount, status
        FROM mess_bill
        WHERE student_id=%s
        ORDER BY mess_bill_id DESC
    """, (student["student_id"],))
    rows = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(rows)

@app.route("/student_complaints/<int:user_id>", methods=["GET"])
def get_student_complaints(user_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT s.student_id, r.room_id, r.room_number
        FROM students s
        LEFT JOIN room_allotment ra ON s.student_id = ra.student_id AND ra.status='active'
        LEFT JOIN rooms r ON ra.room_id = r.room_id
        WHERE s.user_id=%s
    """, (user_id,))
    student = cursor.fetchone()
    if not student:
        cursor.close()
        db.close()
        return jsonify([])

    cursor.execute("""
        SELECT complaint_id, complaint_text, status, complaint_date, room_id
        FROM complaints
        WHERE student_id=%s
        ORDER BY complaint_date DESC, complaint_id DESC
    """, (student["student_id"],))
    rows = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(rows)

@app.route("/student_complaints/add/<int:user_id>", methods=["POST"])
def add_student_complaint(user_id):
    data = request.json
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT s.student_id, r.room_id
        FROM students s
        LEFT JOIN room_allotment ra ON s.student_id = ra.student_id AND ra.status='active'
        LEFT JOIN rooms r ON ra.room_id = r.room_id
        WHERE s.user_id=%s
    """, (user_id,))
    student = cursor.fetchone()
    if not student:
        cursor.close()
        db.close()
        return jsonify({"status": "fail", "message": "Student not found"}), 404

    insert_cursor = db.cursor()
    insert_cursor.execute(
        "INSERT INTO complaints (student_id, room_id, complaint_text, status, complaint_date) VALUES (%s, %s, %s, %s, %s)",
        (student["student_id"], student["room_id"], data.get("complaint_text"), "Pending", data.get("complaint_date"))
    )
    db.commit()
    insert_cursor.close()
    cursor.close()
    db.close()
    return jsonify({"status": "success"})

@app.route("/student_outing/<int:user_id>", methods=["GET"])
def get_student_outing(user_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT student_id FROM students WHERE user_id=%s", (user_id,))
    student = cursor.fetchone()
    if not student:
        cursor.close()
        db.close()
        return jsonify([])

    cursor.execute("""
        SELECT outing_id, reason, outing_date, out_time, in_time, parent_status, warden_status
        FROM outing
        WHERE student_id=%s
        ORDER BY outing_date DESC, outing_id DESC
    """, (student["student_id"],))
    rows = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(rows)

@app.route("/student_outing/add/<int:user_id>", methods=["POST"])
def add_student_outing(user_id):
    data = request.json
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT student_id FROM students WHERE user_id=%s", (user_id,))
    student = cursor.fetchone()
    if not student:
        cursor.close()
        db.close()
        return jsonify({"status": "fail", "message": "Student not found"}), 404

    insert_cursor = db.cursor()
    insert_cursor.execute(
        "INSERT INTO outing (student_id, reason, outing_date, out_time, in_time, parent_status, warden_status) VALUES (%s, %s, %s, %s, %s, %s, %s)",
        (student["student_id"], data.get("reason"), data.get("outing_date"), data.get("out_time"), data.get("in_time"), "Pending", "Pending")
    )
    db.commit()
    insert_cursor.close()
    cursor.close()
    db.close()
    return jsonify({"status": "success"})

@app.route("/student_leave/<int:user_id>", methods=["GET"])
def get_student_leave(user_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT student_id FROM students WHERE user_id=%s", (user_id,))
    student = cursor.fetchone()
    if not student:
        cursor.close()
        db.close()
        return jsonify([])

    cursor.execute("""
        SELECT leave_id, reason, start_date, end_date, parent_status, warden_status, applied_on, remarks
        FROM leave_requests
        WHERE student_id=%s
        ORDER BY applied_on DESC, leave_id DESC
    """, (student["student_id"],))
    rows = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(rows)

@app.route("/student_leave/add/<int:user_id>", methods=["POST"])
def add_student_leave(user_id):
    data = request.json
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT student_id FROM students WHERE user_id=%s", (user_id,))
    student = cursor.fetchone()
    if not student:
        cursor.close()
        db.close()
        return jsonify({"status": "fail", "message": "Student not found"}), 404

    insert_cursor = db.cursor()
    insert_cursor.execute(
        "INSERT INTO leave_requests (student_id, reason, start_date, end_date, parent_status, warden_status, applied_on, remarks) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
        (student["student_id"], data.get("reason"), data.get("start_date"), data.get("end_date"), "Pending", "Pending", data.get("applied_on"), data.get("remarks"))
    )
    db.commit()
    insert_cursor.close()
    cursor.close()
    db.close()
    return jsonify({"status": "success"})

@app.route("/student_announcements", methods=["GET"])
def get_student_announcements():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT announcement_id, title, message, role, created_at
        FROM announcements
        WHERE role IN ('all', 'student')
        ORDER BY created_at DESC, announcement_id DESC
    """)
    rows = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(rows)

@app.route("/parent_dashboard/<int:user_id>", methods=["GET"])
def get_parent_dashboard(user_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT s.student_id, s.name, s.course, s.semester, s.room_type,
               r.room_number
        FROM students s
        LEFT JOIN room_allotment ra ON s.student_id = ra.student_id AND ra.status='active'
        LEFT JOIN rooms r ON ra.room_id = r.room_id
        WHERE s.parent_id=%s
        ORDER BY s.student_id ASC
    """, (user_id,))
    children = cursor.fetchall()

    total_pending = 0
    attendance_percentage = 0
    if children:
        student_ids = tuple(child["student_id"] for child in children)
        placeholders = ", ".join(["%s"] * len(student_ids))
        cursor.execute(
            f"SELECT COUNT(*) as total, SUM(CASE WHEN status='Present' THEN 1 ELSE 0 END) as present_count FROM attendance WHERE student_id IN ({placeholders})",
            student_ids
        )
        stats = cursor.fetchone()
        total = stats["total"] or 0
        present_count = stats["present_count"] or 0
        attendance_percentage = round((present_count / total) * 100, 1) if total else 0

        cursor.execute(
            f"SELECT (SELECT COUNT(*) FROM outing WHERE student_id IN ({placeholders}) AND parent_status='Pending') + (SELECT COUNT(*) FROM leave_requests WHERE student_id IN ({placeholders}) AND parent_status='Pending') as pending_total",
            student_ids + student_ids
        )
        total_pending = cursor.fetchone()["pending_total"]

    cursor.close()
    db.close()
    return jsonify({
        "children": children,
        "attendance_percentage": attendance_percentage,
        "pending_approvals": total_pending
    })

@app.route("/parent_attendance/<int:user_id>", methods=["GET"])
def get_parent_attendance(user_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT a.attendance_id, s.name as student_name, a.date, a.status, a.marked_by
        FROM attendance a
        JOIN students s ON a.student_id = s.student_id
        WHERE s.parent_id=%s
        ORDER BY a.date DESC, s.name ASC
    """, (user_id,))
    rows = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(rows)

@app.route("/parent_mess_bill/<int:user_id>", methods=["GET"])
def get_parent_mess_bill(user_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT mb.mess_bill_id, s.name as student_name, mb.month, mb.amount, mb.status
        FROM mess_bill mb
        JOIN students s ON mb.student_id = s.student_id
        WHERE s.parent_id=%s
        ORDER BY mb.mess_bill_id DESC
    """, (user_id,))
    rows = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(rows)

@app.route("/parent_outing/<int:user_id>", methods=["GET"])
def get_parent_outing(user_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT o.outing_id, s.name as student_name, o.reason, o.outing_date, o.out_time, o.in_time, o.parent_status, o.warden_status
        FROM outing o
        JOIN students s ON o.student_id = s.student_id
        WHERE s.parent_id=%s
        ORDER BY o.outing_date DESC, o.outing_id DESC
    """, (user_id,))
    rows = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(rows)

@app.route("/parent_leave/<int:user_id>", methods=["GET"])
def get_parent_leave(user_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT l.leave_id, s.name as student_name, l.reason, l.start_date, l.end_date, l.parent_status, l.warden_status, l.applied_on, l.remarks
        FROM leave_requests l
        JOIN students s ON l.student_id = s.student_id
        WHERE s.parent_id=%s
        ORDER BY l.applied_on DESC, l.leave_id DESC
    """, (user_id,))
    rows = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(rows)

@app.route("/parent_outing/approve/<int:outing_id>", methods=["PUT"])
def approve_parent_outing(outing_id):
    data = request.json
    db = get_db()
    cursor = db.cursor()
    cursor.execute("UPDATE outing SET parent_status=%s WHERE outing_id=%s", (data.get("parent_status"), outing_id))
    db.commit()
    cursor.close()
    db.close()
    return jsonify({"status": "success"})

@app.route("/parent_leave/approve/<int:leave_id>", methods=["PUT"])
def approve_parent_leave(leave_id):
    data = request.json
    db = get_db()
    cursor = db.cursor()
    cursor.execute("UPDATE leave_requests SET parent_status=%s WHERE leave_id=%s", (data.get("parent_status"), leave_id))
    db.commit()
    cursor.close()
    db.close()
    return jsonify({"status": "success"})

@app.route("/parent_announcements", methods=["GET"])
def get_parent_announcements():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT announcement_id, title, message, role, created_at
        FROM announcements
        WHERE role IN ('all', 'parent')
        ORDER BY created_at DESC, announcement_id DESC
    """)
    rows = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(rows)

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    db = get_db()
    cursor = db.cursor(dictionary=True)
    query = "SELECT * FROM users WHERE username=%s AND password=%s"
    cursor.execute(query, (username, password))
    user = cursor.fetchone()
    cursor.close()
    db.close()

    if user:
        return jsonify({
            "status": "success",
            "role": user["role"],
            "user_id": user["id"]
        })
    else:
        return jsonify({"status": "fail", "message": "Invalid credentials"})

if __name__ == "__main__":
    app.run(debug=True)
