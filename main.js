/*
 * Copyright (c) 2010, 2013, Oracle and/or its affiliates. All rights reserved.
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
 *
 * This code is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License version 2 only, as
 * published by the Free Software Foundation.  Oracle designates this
 * particular file as subject to the "Classpath" exception as provided
 * by Oracle in the LICENSE file that accompanied this code.
 *
 * This code is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
 * version 2 for more details (a copy is included in the LICENSE file that
 * accompanied this code).
 *
 * You should have received a copy of the GNU General Public License version
 * 2 along with this work; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * Please contact Oracle, 500 Oracle Parkway, Redwood Shores, CA 94065 USA
 * or visit www.oracle.com if you need additional information or have any
 * questions.
 */

load("fx:base.js")
load("fx:controls.js")
load("fx:graphics.js")

var clList = ['javafx.scene.layout.BorderPane', 'javafx.stage.FileChooser', 
				'java.io.File', 'javafx.application.Platform', 'java.nio.file.Files',
				'java.util.stream.Collectors', 'org.fxmisc.richtext.CodeArea', 
				'org.fxmisc.richtext.LineNumberFactory']

for (var i in clList) {
	var clName = clList[i].split('.').pop()
	this[clName] = Java.type(clList[i])
}

var JSEditor = function (){}

JSEditor.prototype = {

	editor : function () {
		var textArea = new CodeArea()
		textArea.setParagraphGraphicFactory(LineNumberFactory.get(textArea));
		textArea.textProperty().addListener(function (obs, oldText, newText)  {
            textArea.setStyleSpans(0, computeHighlighting(newText));
        });
		return textArea
	},

	tabs : new TabPane(),

	console : function(){
		var c = new TextArea()
		c.setEditable(false)
		return c
	}(),

	start : function (stage) {
		var root = new BorderPane()
		root.setTop(this.menuBar())
		root.setCenter(this.mainLayout())
		var screenBounds = Screen.getPrimary().getVisualBounds(); 
		var scene = new Scene(root, screenBounds.getWidth(), screenBounds.getHeight());
		stage.setScene(scene)
		stage.show()
	},

	openFile : function (file) {
		tab = new Tab()
		tab.setText(file.getName())
	
		// @fixme - need to create Task or Service for async load file content
		var editor = this.editor()
		editor.appendText(Files.lines(file.toPath()).collect(Collectors.joining("\n")))
		tab.setContent(editor)
		this.tabs.getTabs().add(tab)
	},

	mainLayout : function () {
		var mainPane = new SplitPane()
		mainPane.getItems().add(this.fileTreePanel())
		mainPane.getItems().add(this.editorPanel())
		mainPane.getItems().add(this.inspectorPanel())
		mainPane.setDividerPositions(0.15, 0.85, 0.10);
		return mainPane
	},

	fileTreePanel : function() {
		var panel = new StackPane()
		panel.getChildren().add(new Label('LEFT'))
		return panel
	},

	editorPanel : function () {
		var editor = new SplitPane();
		var self = this
		editor.getItems().addAll(function(){
			var c = new StackPane()
			c.getChildren().add(self.tabs)
			return c
		}(), function (){
			var c = new StackPane()
			var wrapper = new VBox();
			var menu = new HBox()
			var clearConsole = new Button("Clear")
			clearConsole.setOnAction(function(e){
				self.console.clear()
			})
			menu.getChildren().add(clearConsole)
			wrapper.getChildren().addAll(menu, self.console)
			c.getChildren().add(wrapper)
			return c
		}())
		editor.setDividerPositions(0.85, 0.15)
		editor.setOrientation(Orientation.VERTICAL)
		return editor
	},

	inspectorPanel : function () {
		var panel = new StackPane()
		panel.getChildren().add(new Label('RIGHT'))
		return panel
	},

	menuBar : function () {
		var self = this
		var menuBar = new MenuBar()
		var filemenu = new Menu('File')
		var newFile = new MenuItem("New")
		var openFile = new MenuItem("Open")
		var openDir = new MenuItem("Open directory")
		var close = new MenuItem("Close")
		filemenu.getItems().addAll(newFile, openFile, openDir, new SeparatorMenuItem(), close)
		menuBar.getMenus().add(filemenu)

		newFile.setOnAction(createNewFile)

		function createNewFile(e) {
			var dialog = new FileChooser();
			dialog.setTitle("Create new file");
			var file = dialog.showSaveDialog($STAGE);
			if (file != null) {
				try {
					if (!file.exists()) {
						file.createNewFile()
					}
				} catch (e) {
					// @todo
					e.printStackTrace()
				}
			}
		}

		openFile.setOnAction(function(e){
			var dialog = new FileChooser();
			dialog.setTitle("Open file");
			var file = dialog.showOpenDialog($STAGE);
			print(file)
			if (file != null) {
				try {
					if (file.exists()) {
						self.openFile(file)
					}
				} catch (e) {
					// @todo
					e.printStackTrace()
				}
			}
		})



		close.setOnAction(exit)

		function exit (e) {
			Platform.exit()
		}

		return menuBar;
	}

}

// Start JavaFX application
function start (stage) {
	new JSEditor().start(stage)
}
