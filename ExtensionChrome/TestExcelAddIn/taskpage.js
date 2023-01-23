Office.onReady((info) => {});

function pasteClipboard() {
    navigator.clipboard.readText().then(clipText => {
        Excel.run(function (ctx) {
            var sheet = ctx.workbook.worksheets.getActiveWorksheet();
            sheet.getRange("A1").values = clipText;
            return ctx.sync();
        }).catch(errorHandler);
    });
}

Office.initialize = function () {
    Office.context.document.registerCommand("pasteClipboard", pasteClipboard, {icon: "paste", title: "Paste Clipboard"});
    Office.context.document.addHandlerAsync(Office.EventType.DocumentEvents.OnAccessKey, pasteClipboard);
};
