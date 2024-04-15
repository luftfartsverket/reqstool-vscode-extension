[![Commit Activity](https://img.shields.io/github/commit-activity/m/Luftfartsverket/reqstool-vscode-extension?label=commits&style=for-the-badge)](https://github.com/Luftfartsverket/reqstool-vscode-extension/pulse)
[![GitHub Issues](https://img.shields.io/github/issues/Luftfartsverket/reqstool-vscode-extension?style=for-the-badge&logo=github)](https://github.com/Luftfartsverket/reqstool-vscode-extension/issues)
[![License](https://img.shields.io/github/license/Luftfartsverket/reqstool-vscode-extension?style=for-the-badge&logo=opensourceinitiative)](https://opensource.org/license/mit/)
[![Build](https://img.shields.io/github/actions/workflow/status/Luftfartsverket/reqstool-vscode-extension/build.yml?style=for-the-badge&logo=github)](https://github.com/Luftfartsverket/reqstool-vscode-extension/actions/workflows/build.yml)

# Reqstool extension for Visual Studio Code

This extension provides various features for use with [reqstool](https://github.com/Luftfartsverket/reqstool-client) such as:

* Display information upon hover over an annotation about requirements, software verification cases, and manual verification cases 

## Prerequisites

* [reqstool](https://github.com/Luftfartsverket/reqstool-client)

## Usage

Open a workspace that has requirements in the format specified by `reqstool`. The extensions should initialize automatically. 
There is an output channel that will show when a workspace is initialized. 

## File watcher

If a directory with requirements files is found, it's watched for changes. The extension will rerun *reqstool* when a change is detected.

## Supported languages

* Java
* Python

## Development

* After cloning, run: `npm install`
* To debug, run `npm run watch` and press `F5`. In the window that appears, open a project with annotations an a supported language.
* Build with `npm run build`
