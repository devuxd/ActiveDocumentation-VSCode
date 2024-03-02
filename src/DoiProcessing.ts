import * as vscode from 'vscode';
import WebSocket from 'ws';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { readFile } from 'fs/promises';
import { WebSocketConstants } from './WebSocketConstants';
import { buildFolderHierarchy } from './utilites';

export class DoiProcessing{
    private ws: WebSocket | null;
    private projectPath:string;
    private static instance: DoiProcessing|null = null;

    private timedVisitedFiles: { timeStamp: string, filePath: string }[] = [];

    public constructor(projectPath:string,ws:WebSocket|null){
        this.projectPath=projectPath;
        this.ws = ws;
        this.monitorWorkSpaceBehavior();

    }

    public static getInstance(projectPath:string = "", ws: WebSocket | null = null): DoiProcessing {
        if (!DoiProcessing.instance) {
            DoiProcessing.instance = new DoiProcessing(projectPath,ws);
        }
        return DoiProcessing.instance;
    }

    public updateProjectWs(projectPath: string, ws: WebSocket): void {
        this.projectPath = projectPath;
        this.ws = ws;
        this.monitorWorkSpaceBehavior();
        //this.learningDRPath = path.join(this.currentProjectPath, Constants.LEARNING_DR_DIRECTORY);

    }

    private monitorWorkSpaceBehavior(){
        // Listening for file opening events in VSCode
        vscode.workspace.onDidOpenTextDocument(this.newVisitedFile.bind(this));

    }

    public getVisitedFiles(): { timeStamp: string, filePath: string }[] {
        // Directly return the array of visited files
        return this.timedVisitedFiles;
    }


    private newVisitedFile(document: vscode.TextDocument): void {
        const filePath = document.uri.fsPath;
        this.updateVisitedFiles(filePath);
        // Assuming updateSearchHistory() functionality is handled elsewhere or omitted
        //this.currentFilePath = filePath;
    }

    private updateVisitedFiles(newFilePath: string): void {
        const currentTime = new Date().getTime();
        const timeStamp = currentTime.toString();

        if (this.timedVisitedFiles.length > 0) {
            const lastVisitedFile = this.timedVisitedFiles[this.timedVisitedFiles.length - 1];
            const lastTimeStamp = parseInt(lastVisitedFile.timeStamp);

            // If the new visit occurs within 1 second of the last, remove the last entry
            if (currentTime - lastTimeStamp < 1000) {
                this.timedVisitedFiles.pop();
            }
        }

        this.timedVisitedFiles.push({ timeStamp, filePath: newFilePath });
    }


}