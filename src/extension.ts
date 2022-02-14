// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "myvuestuff" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('myvuestuff.createComponent', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		
		const outpath=getRelativePath('components')
		if(!outpath) return
		console.log(outpath);
		const editor=vscode.window.activeTextEditor
		//console.log(editor?.selection);
		const start=editor?.selection?.start
		//if(selection?.isEmpty || !start || !end) return console.log('No selection');
		
		//const range=new vscode.Range(start,end)
		if(!start) return showError('No selection');
		const range = editor?.document.getWordRangeAtPosition(start)
		const name=editor?.document.getText(range);
		console.log(name)
		const filepath=`${outpath}/${name}.vue`
		let msg='Creating a new component'
		let modal=vscode.window.showInformationMessage
		if(fs.existsSync(filepath)) {
			msg='Warning: Overwriting existing component'
			modal=vscode.window.showWarningMessage
		}
		const decision=modal(
			`${msg}: ${name}.vue`,
			{modal:true},
			'OK'
		);

		const content = `// Generated with Command: Create Component
<template>
	<div>
        <h2>Component: ${name}</h2>
		<slot></slot>
	</div>
</template>

<script setup>

</script>

<style lang="scss" scoped>

</style>`
		
		decision.then(a=>{
			console.log('modal',a);
			if(a=="OK") createFile(outpath,name+'.vue',content)
		})
		
		//const ws=vscode.workspace
		//console.log(ws);
		
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}


const createFile = async (
	path: string, name: string, content: string
	//templateItem: vsc.vscTemplateItem,
	//userInputs: vsc.vscUserInputs = {}
): Promise<void> => {

	if(!fs.existsSync(path)) fs.mkdirSync(path)
	const filePath = path + '/' + name
	console.log(filePath);
	fs.writeFileSync(filePath, content)	
}
function getRelativePath(dir: string) {
	//throw new Error('Function not implemented.');
	const editor = vscode.window.activeTextEditor;
	const d=editor?.document
	const uri=d?.uri
	if(!d) return showError('Requires active document');
	if(d?.isUntitled) return showError('Requires document to be saved');
	if(uri?.scheme != 'file') return showError('Requires document to be saved to file');
	const path=uri.path.split('/')
	let i = path.indexOf(dir)
	if(i<0) i=path.length-1
	return path.slice(0,i).join('/')+'/'+dir
}

function showError(msg: string): any {
	vscode.window.showErrorMessage(msg);
}

