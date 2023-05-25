const fs = require("fs");
const path = require("path");

const Subject = require("../models/subject");
const Enrollment = require("../models/enrollment");

exports.getSubjects = (req, res, next) => {
  const isEnroll = async (subjectId) => {
    const result = await Enrollment.findOne({
      where: { userId: req.body.userId, subjectId: subjectId },
    });
    if (result) return true;
    return false;
  };
  Subject.findAll({ attributes: ["id", "name", "code"] })
    .then(async (result) => {
      for (let subject of result) {
        subject.dataValues.isEnroll = await isEnroll(subject.id);
      }
      res.status(200).json(result);
    })
    .catch((err) => {
      err.statusCode = 500;
      next(err);
    });
};

exports.enrollInSubject = async (req, res, next) => {
  const [subjectId, userId] = [req.params.subjectId, req.body.userId];
  const subject = await Subject.findOne({ where: { id: subjectId } });
  if (subject.prerequisiteId) {
    const pre = await Enrollment.findOne({
      where: { userId: userId, subjectId: subject.prerequisiteId },
    });
    if (!pre) {
      const err = new Error("You have to enroll in prerequisite first.");
      err.statusCode = 400;
      next(err);
      return;
    } else {
      const enrolled = await Enrollment.findOne({
        where: { userId: userId, subjectId: subjectId },
      });
      if (enrolled) {
        const err = new Error("You already enrolled in this subject.");
        err.statusCode = 400;
        next(err);
        return;
      } else {
        Enrollment.create({ userId: userId, subjectId: subjectId })
          .then(() => {
            res.status(201).json({
              message: "You have been enrolled in subject successfully.",
            });
          })
          .catch((err) => {
            err.statusCode = 500;
            next(err);
          });
      }
    }
  } else {
     const enrolled = await Enrollment.findOne({
       where: { userId: userId, subjectId: subjectId },
     });
     if (enrolled) {
       const err = new Error("You already enrolled in this subject.");
       err.statusCode = 400;
       next(err);
       return;
     } else {
       Enrollment.create({ userId: userId, subjectId: subjectId })
         .then(() => {
           res.status(201).json({
             message: "You have been enrolled in subject successfully.",
           });
         })
         .catch((err) => {
           err.statusCode = 500;
           next(err);
         });
     }
  }
};

exports.getClass = (req, res, next) => {
  const { subjectId } = req.params;
  Subject.findOne({ where: { id: subjectId } })
    .then((subject) => {
      fs.readdir(subject.classRoom, (err, files) => {
        if (!err) return res.status(200).json(files);
        err.statusCode = 500;
        next(err);
        return;
      });
    })
    .catch((err) => {
      err.statusCode = 500;
      next(err);
    });
};

exports.downloadFile = (req, res, next) => {
  const { subjectId, fileName } = req.params;
  Subject.findOne({ where: { id: subjectId } })
    .then((subject) => {
      fs.access(path.join(subject.classRoom, fileName), (err) => {
        if (!err)
          return res
            .status(200)
            .download(path.join(subject.classRoom, fileName));
        err.statusCode = 500;
        next(err);
        return;
      });
    })
    .catch((err) => {
      err.statusCode = 500;
      next(err);
    });
};
