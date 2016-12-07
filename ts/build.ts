import * as _ from "lodash";
import * as fs from "fs";
import * as path from "path";
import * as shelljs from "shelljs";

import { DirectionalGraph } from "./DirectionalGraph";

export interface IProject {
    filepath: string;
    name: string;
    version: string;
    dependencies: Array<IDependency>;
}

export interface IDependency {
    name: string;
    version: string;
}

export async function build(projectFilespaths: Array<string>): Promise<void> {
    const projectFileContents = await Promise.all(projectFilespaths.map(loadFile));
    const projectJsons = projectFileContents.map(x => JSON.parse(x));
    const projects = zipWith<string, any, IProject>(projectFilespaths, projectJsons, parseProjectSetting);
    const dependencies = _.flatMap(
        projects,
        project => project.dependencies.map(dependency => ({
            from: project.name,
            to: dependency.name
        })));
    
    var graph = DirectionalGraph.fromEdges(dependencies);

    while (graph.edges.length > 0) {
        await buildProjects(graph.tailNodes, projects);
        graph = DirectionalGraph.withoutNodes(graph, graph.tailNodes);
    }

    await buildProjects(graph.headNodes, projects);
}

async function buildProjects(names: Array<string>, projects: Array<IProject>): Promise<void> {

    var projectsToBuild = projects
        .filter(project => names.indexOf(project.name))
        .map(buildProject);

    await Promise.all(projectsToBuild);
}

async function buildProject(project: IProject): Promise<boolean> {
    return new Promise<boolean>(resolve => {
        shelljs.exec(`dotnet build ${project.filepath}`, code => {
            resolve(code === 0);
        });
    });
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
        filepath: filepath,
        name: path.basename(path.dirname(filepath)),
        version: json.version,
        dependencies: dependencies
    };
}
