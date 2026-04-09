const attendanceService = require("../services/attendance.service");
const { successResponse } = require("../utils/response");

const markAttendance = async (req, res) => {
  const data = await attendanceService.markAttendance(req, req.body);
  return successResponse(res, {
    statusCode: 201,
    message: "Attendance marked successfully",
    data
  });
};

const getAttendanceReport = async (req, res) => {
  const result = await attendanceService.getAttendanceReport(req, req.query);
  return successResponse(res, {
    message: "Attendance report fetched successfully",
    data: result.items,
    meta: result.meta
  });
};

module.exports = {
  markAttendance,
  getAttendanceReport
};
