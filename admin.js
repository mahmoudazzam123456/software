const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");

const Department = require("../models/department");
const Subject = require("../models/subject");
const User = require("../models/user");

const user = require("../util/user");
const Enrollment = require("../models/enrollment");

exports.addDoctor = (req, res, next) => {
  const { name, email, password } = req.body;
  user
    .createUser({
      name: name,
      email: email,
      password: password,
      role: "doctor",
    })
    .then(() => {
      res
        .status(201)
        .json({ message: "Doctor account has been added successfully." });
    })
    .catch((err) => {
      err.statusCode = 500;
      next(err);
    });
};

exports.addDepartment = (req, res, next) => {
  const { name, code } = req.body;
  Department.create({ name: name, code: code })
    .then(() => {
      res
        .status(201)
        .json({ message: "Department has been added successfully." });
    })
    .catch((err) => {
      err.statusCode = 500;
      next(err);
    });
};

exports.addSubject = (req, res, next) => {
  const { name, code, departmentCode, prerequisiteCode } = req.body;
  let departmentId,
    prerequisiteId = null;
  Department.findOne({ where: { code: departmentCode } })
    .then((department) => {
      departmentId = department.id;
      if (prerequisiteCode)
        return Subject.findOne({ where: { code: prerequisiteCode } });
      else return Promise.resolve({ id: null });
    })
    .then((subject) => {
      prerequisiteId = subject.id;
      let classRoom = path.join(__dirname, "..", "data", `${name}-${code}`);
      fs.mkdirSync(classRoom);
      return Subject.create({
        name: name,
        code: code,
        departmentId: departmentId,
        prerequisiteId: prerequisiteId,
        classRoom: classRoom,
      });
    })
    .then(() => {
      res.status(201).json({ message: "Subject has been added successfully." });
    })
    .catch((err) => {
      err.statusCode = 500;
      next(err);
    });
};

exports.addStudent = (req, res, next) => {
  const { id, name, email, password } = req.body;
  user
    .createUser({
      id: id,
      name: name,
      email: email,
      password: password,
      role: "student",
    })
    .then(() => {
      res
        .status(201)
        .json({ message: "Student account has been added successfully." });
    })
    .catch((err) => {
      err.statusCode = 500;
      next(err);
    });
};

exports.addDoctorToClass = (req, res, next) => {
  const { doctorEmail, subjectCode } = req.body;
  User.findOne({ where: { email: doctorEmail } })
    .then((doctor) => {
      return Subject.update(
        { doctorId: doctor.id },
        { where: { code: subjectCode } }
      );
    })
    .then(() => {
      res.status(200).json({
        message: "Doctor have been added to classroom of subject successfully.",
      });
    })
    .catch((err) => {
      err.statusCode = 500;
      next(err);
    });
};

exports.getStudentsEnrolledInSubject = async (req, res, next) => {
  const subjectId = req.params.subjectId;
  Enrollment.findAll({
    where: { subjectId: subjectId },
    include: [{ model: User, attributes: ["id", "name"] }],
  })
    .then((enrollments) => {
      const students = enrollments.map((enrollment) => {
        return {
          academicNumber: enrollment.user.id,
          name: enrollment.user.name,
        };
      });
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Students");

      worksheet.columns = [
        { header: "Academic Number", key: "academicNumber", width: 20 },
        { header: "Name", key: "name", width: 20 },
        { header: "week 1", key: "week", width: 10 },
        { header: "week 2", key: "week", width: 10 },
        { header: "week 3", key: "week", width: 10 },
        { header: "week 4", key: "week", width: 10 },
        { header: "week 5", key: "week", width: 10 },
        { header: "week 6", key: "week", width: 10 },
        { header: "week 7", key: "week", width: 10 },
        { header: "week 8", key: "week", width: 10 },
        { header: "week 9", key: "week", width: 10 },
        { header: "week 10", key: "week", width: 10 },
        { header: "week 11", key: "week", width: 10 },
        { header: "week 12", key: "week", width: 10 },
      ];
      worksheet.addRows(students);
      const filePath = path.join(
        __dirname,
        "..",
        "data",
        `students-${subjectId}-${Math.random()}.xlsx`
      );
      workbook.xlsx.writeFile(filePath).then(() => {
        res.status(200).download(filePath);
      });
    })
    .catch((err) => {
      err.statusCode = 500;
      next(err);
    });
};
