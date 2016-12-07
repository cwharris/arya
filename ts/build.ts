import * as fs from "fs";
import * as path from "path";

export interface IProject {
    name: string;
    version: string;
    dependencies: Array<IDependency>;
}

export interface IDependency {
    name: string;
    version: string;
}

export async function build(projectFilespaths: Array<string>): Promise<void> {
    let projectFileContents = await Promise.all(projectFilespaths.map(loadFile));
    let projectJsons = projectFileContents.map(x => JSON.parse(x));
    let projectSettings = zipWith<string, any, IProject>(projectFilespaths, projectJsons, parseProjectSetting);
    console.log(projectSettings);
}

function zipWith<T1, T2, TR>(ax: T1[], bx: T2[], selector: (a: T1, b: T2) => TR): Array<TR> {
    return ax.length < bx.length
        ? ax.map((a, i) => selector(a, bx[i]))
        : bx.map((b, i) => selector(ax[i], b));
}

async function loadFile(filepath: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        console.log(`reading: ${filepath}`);
        fs.readFile(filepath, "utf-8", (_err, _data) => {
            if (_err) {
                reject();
            } else {
                resolve(_data);
            }
        })
    });
}

function parseProjectSetting(filepath: string, json: any): IProject {
    const dependencies: Array<IDependency> = [];
    
    for (var key in json.dependencies) {
        if (json.dependencies.hasOwnProperty(key)) {
            var versionOrDetails = json.dependencies[key];
            if (typeof versionOrDetails === "string") {
                dependencies.push({
                    name: key,
                    version: versionOrDetails
                });
            } else {
                dependencies.push({
                    name: key,
                    version: versionOrDetails.version
                });
            }
        }
    }

    return {
        name: path.basename(path.dirname(filepath)),
        version: json.version,
        dependencies: dependencies
    };
}
