const http = require('http');
const url = require('url');

let students = [];

// Email validation regex
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Send JSON response
function sendResponse(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json'
    });
    res.end(JSON.stringify(data));
}

// Generate unique ID
function generateId() {
    return Date.now().toString();
}

const server = http.createServer((req, res) => {

    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const method = req.method;

    // -------- GET ALL STUDENTS --------
    if (path === '/students' && method === 'GET') {
        return sendResponse(res, 200, {
            success: true,
            data: students
        });
    }

    // -------- GET STUDENT BY ID --------
    if (path.startsWith('/students/') && method === 'GET') {

        const id = path.split('/')[2];
        const student = students.find(s => s.id === id);

        if (!student) {
            return sendResponse(res, 404, {
                success: false,
                message: "Student not found"
            });
        }

        return sendResponse(res, 200, {
            success: true,
            data: student
        });
    }

    // -------- CREATE STUDENT --------
    if (path === '/students' && method === 'POST') {

        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {

            try {

                const data = JSON.parse(body);

                const { name, email, course, year } = data;

                // validation
                if (!name || !email || !course || !year) {
                    return sendResponse(res, 400, {
                        success: false,
                        message: "All fields are required"
                    });
                }

                if (!isValidEmail(email)) {
                    return sendResponse(res, 400, {
                        success: false,
                        message: "Invalid email format"
                    });
                }

                if (year < 1 || year > 4) {
                    return sendResponse(res, 400, {
                        success: false,
                        message: "Year must be between 1 and 4"
                    });
                }

                const newStudent = {
                    id: generateId(),
                    name,
                    email,
                    course,
                    year
                };

                students.push(newStudent);

                return sendResponse(res, 201, {
                    success: true,
                    data: newStudent
                });

            } catch (error) {

                return sendResponse(res, 400, {
                    success: false,
                    message: "Invalid JSON"
                });

            }

        });

        return;
    }

    // -------- UPDATE STUDENT --------
    if (path.startsWith('/students/') && method === 'PUT') {

        const id = path.split('/')[2];
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {

            try {

                const data = JSON.parse(body);
                const { name, email, course, year } = data;

                const studentIndex = students.findIndex(s => s.id === id);

                if (studentIndex === -1) {
                    return sendResponse(res, 404, {
                        success: false,
                        message: "Student not found"
                    });
                }

                if (!name || !email || !course || !year) {
                    return sendResponse(res, 400, {
                        success: false,
                        message: "All fields are required"
                    });
                }

                if (!isValidEmail(email)) {
                    return sendResponse(res, 400, {
                        success: false,
                        message: "Invalid email format"
                    });
                }

                if (year < 1 || year > 4) {
                    return sendResponse(res, 400, {
                        success: false,
                        message: "Year must be between 1 and 4"
                    });
                }

                students[studentIndex] = {
                    id,
                    name,
                    email,
                    course,
                    year
                };

                return sendResponse(res, 200, {
                    success: true,
                    data: students[studentIndex]
                });

            } catch (error) {

                return sendResponse(res, 400, {
                    success: false,
                    message: "Invalid JSON"
                });

            }

        });

        return;
    }

    // -------- DELETE STUDENT --------
    if (path.startsWith('/students/') && method === 'DELETE') {

        const id = path.split('/')[2];

        const index = students.findIndex(s => s.id === id);

        if (index === -1) {
            return sendResponse(res, 404, {
                success: false,
                message: "Student not found"
            });
        }

        students.splice(index, 1);

        return sendResponse(res, 200, {
            success: true,
            message: "Student deleted successfully"
        });
    }

    // -------- INVALID ROUTE --------
    sendResponse(res, 404, {
        success: false,
        message: "Route not found"
    });

});

server.listen(3000, () => {
    console.log("Server running on port 3000");
});