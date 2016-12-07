import * as path from "path";
import * as shelljs from "shelljs";

export function clean (projectFilepaths: Array<string>) {
    let projectFolders = projectFilepaths.map(filepath => path.dirname(filepath));
    let binFolders = projectFolders.map(filepath => path.join(filepath, "bin"));
    let objFolders = projectFolders.map(filepath => path.join(filepath, "obj"));
    let projectLockFiles = projectFolders.map(filepath => path.join(filepath, "project.lock.json"));

    shelljs.rm("-rf", binFolders);
    shelljs.rm("-rf", objFolders);
    shelljs.rm("-rf", projectLockFiles);
}