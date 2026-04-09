const courseService = require("../services/course.service");
const { successResponse } = require("../utils/response");

const createCourse = async (req, res) => {
  const data = await courseService.createCourse(req, req.body);
  return successResponse(res, {
    statusCode: 201,
    message: "Course created successfully",
    data
  });
};

const listCourses = async (req, res) => {
  const result = await courseService.listCourses(req, req.query);
  return successResponse(res, {
    message: "Courses fetched successfully",
    data: result.items,
    meta: result.meta
  });
};

const getCourse = async (req, res) => {
  const data = await courseService.getCourseById(req, req.params.courseId);
  return successResponse(res, {
    message: "Course fetched successfully",
    data
  });
};

const updateCourse = async (req, res) => {
  const data = await courseService.updateCourse(req, req.params.courseId, req.body);
  return successResponse(res, {
    message: "Course updated successfully",
    data
  });
};

const deleteCourse = async (req, res) => {
  const data = await courseService.deleteCourse(req, req.params.courseId);
  return successResponse(res, {
    message: "Course deleted successfully",
    data
  });
};

module.exports = {
  createCourse,
  listCourses,
  getCourse,
  updateCourse,
  deleteCourse
};
