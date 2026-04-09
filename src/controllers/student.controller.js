const studentService = require("../services/student.service");
const { successResponse } = require("../utils/response");

const createStudent = async (req, res) => {
  const data = await studentService.createStudent(req, req.body);
  return successResponse(res, {
    statusCode: 201,
    message: "Student created successfully",
    data
  });
};

const listStudents = async (req, res) => {
  const result = await studentService.listStudents(req, req.query);
  return successResponse(res, {
    message: "Students fetched successfully",
    data: result.items,
    meta: result.meta
  });
};

const getStudent = async (req, res) => {
  const data = await studentService.getStudentById(req, req.params.studentId);
  return successResponse(res, {
    message: "Student fetched successfully",
    data
  });
};

const updateStudent = async (req, res) => {
  const data = await studentService.updateStudent(req, req.params.studentId, req.body);
  return successResponse(res, {
    message: "Student updated successfully",
    data
  });
};

const deleteStudent = async (req, res) => {
  const data = await studentService.deleteStudent(req, req.params.studentId);
  return successResponse(res, {
    message: "Student deleted successfully",
    data
  });
};

module.exports = {
  createStudent,
  listStudents,
  getStudent,
  updateStudent,
  deleteStudent
};
