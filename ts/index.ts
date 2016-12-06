#!/usr/bin/env node

import * as minimist from "minimist"
import * as path from "path"
import * as shelljs from "shelljs"

shelljs.config.fatal = true;

const args = minimist(process.argv.slice(2));
const dir = args["_"][0] || ".";
const shouldRestore = args["r"] || args["restore"] || false;
const shouldBuild = args["b"] || args["build"] || false;

run();

async function run() {
    const allFiles = shelljs.find(dir);
    const projectJsonFiles = allFiles.filter(isProjectJsonFile);

    if (shouldRestore) {
        await Promise.all(projectJsonFiles.map(restore));
    }

    if (shouldBuild) {
        await Promise.all(projectJsonFiles.map(build));
    }
}

function isProjectJsonFile(filepath: string): boolean {
    return path.basename(filepath).localeCompare("project.json") == 0;
}

async function restore(filepath: string): Promise<boolean> {
    return new Promise<boolean>(resolve => {
        shelljs.exec(
            `dotnet restore ${filepath}`,
            function (code, _stdout, _stderr) {
                resolve(code == 0);
            });
        });
}

async function build(filepath: string):Promise<boolean> {
    return new Promise<boolean>(resolve => {
        shelljs.exec(
            `dotnet build ${filepath}`,
            function (code, _stdout, _stderr) {
                resolve(code == 0);
            });
        });
}
