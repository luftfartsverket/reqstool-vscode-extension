
[![Commit Activity](https://img.shields.io/github/commit-activity/m/Luftfartsverket/reqstool-vscode-extension?label=commits&style=for-the-badge)](https://github.com/Luftfartsverket/reqstool-vscode-extension/pulse)
[![GitHub Issues](https://img.shields.io/github/issues/Luftfartsverket/reqstool-vscode-extension?style=for-the-badge&logo=github)](https://github.com/Luftfartsverket/reqstool-vscode-extension/issues)
[![License](https://img.shields.io/github/license/Luftfartsverket/reqstool-vscode-extension?style=for-the-badge&logo=opensourceinitiative)](https://opensource.org/license/mit/)
[![Build](https://img.shields.io/github/actions/workflow/status/Luftfartsverket/reqstool-vscode-extension/build.yml?style=for-the-badge&logo=github)](https://github.com/Luftfartsverket/reqstool-vscode-extension/actions/workflows/build.yml)

# Reqstool augmentations for Visual Studio Code

This extension works with [reqstool](https://github.com/Luftfartsverket/reqstool-client)  to display requirements, software verification cases and manual verification cases upon hover of an annotation.

## Prerequisites

* [reqstool](https://github.com/Luftfartsverket/reqstool-client)

## Usage

1. Open the workspace settings and set the `reqstool.entryPointDir` property to the directory containing to your requirements etc.  
  This is the same path you would give *reqstool* directly when running it standalone.

1. Reload VSCode.

2. Open a file from a [supported language](#supported-languages) and the extension will load.

## Commands

* `Update`: reruns *reqstool*

## File watcher

The directory set in `reqstool.entryPointDir` is watched for changes. The extension will rerun *reqstool* when a change is detected.

## Supported languages

* Java
* Python

## Development

* After cloning, run: `npm install`
* To debug, run `npm run watch` and press `F5`. In the window that appears, open a project with annotations an a supported language.
* Build with `npm run build`
