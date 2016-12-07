#!/usr/bin/env node

import * as minimist from "minimist"
import * as path from "path"
import * as shelljs from "shelljs"

import { clean } from "./clean";
import { restore } from "./restore";
import { build } from "./build";

shelljs.config.fatal = true;

const args = minimist(process.argv.slice(2));
const dir = args["_"][0] || ".";
const shouldClean = args["c"] || args["clean"] || false;
const shouldRestore = args["r"] || args["restore"] || false;
const shouldBuild = args["b"] || args["build"] || false;

run();

async function run() {
    const projectJsonFiles = shelljs.find(dir).filter(isProjectJsonFile);

    try {
        if (shouldClean) {
            console.log("cleaning");
            await clean(projectJsonFiles);
            console.log("cleaning - done");
        }
        if (shouldRestore) {
            console.log("restoring");
            await restore(projectJsonFiles);
            console.log("restoring - done");
        }
        if (shouldBuild) {
            console.log("building");
            await build(projectJsonFiles);
            console.log("building - done");
        }
    } catch (ex) {
        console.log(ex);
    }
}

function isProjectJsonFile(filepath: string): boolean {
    return path.basename(filepath).localeCompare("project.json") == 0;
}
