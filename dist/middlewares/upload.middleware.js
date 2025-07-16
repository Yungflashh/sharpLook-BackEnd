"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMultiple = exports.uploadSingle2 = exports.uploadSingle = void 0;
// src/middlewares/multer.ts
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
exports.uploadSingle = upload.single("identityImage");
exports.uploadSingle2 = upload.single("serviceImage");
exports.uploadMultiple = upload.array("portfolioImages", 10);
