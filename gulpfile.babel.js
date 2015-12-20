/*
 The build is provided by the Modern Web Dev Build: https://github.com/dsebastien/modernWebDevBuild
 */
"use strict";

import gulp from "gulp";

import modernWebDevBuild from "modern-web-dev-build";

let options = {};

options.distEntryPoint = "core/core.bootstrap.js"; // TODO rename to correct file

modernWebDevBuild.registerTasks(gulp, options);
