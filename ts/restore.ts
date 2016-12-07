import * as shelljs from "shelljs";

export async function restore(projectFilespaths: Array<string>): Promise<void> {
    await Promise.all(projectFilespaths.map(restoreProject));
}

function restoreProject(filepath: string): Promise<boolean> {
    return new Promise<boolean>(resolve => {
        shelljs.exec(
            `dotnet restore ${filepath}`,
            function (code, _stdout, _stderr) {
                resolve(code == 0);
            });
        });
}