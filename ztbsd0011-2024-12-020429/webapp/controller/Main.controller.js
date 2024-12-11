sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/viz/ui5/controls/VizFrame",
    "sap/viz/ui5/data/FlattenedDataset",
    "sap/viz/ui5/controls/common/feeds/FeedItem"
],
function (Controller) {
    "use strict";

    return Controller.extend("ztbsd0011.controller.Main", {
        onInit: function () {
        },
        comboBoxChange : function () {
            // 선택된 연도를 가져옵니다.
            let year = this.byId("idSelector").getSelectedKey();
        
            // 필터를 생성합니다.
            let oFilter = new sap.ui.model.Filter("Salesyr", sap.ui.model.FilterOperator.EQ, year);
        
            // VizFrame의 데이터 바인딩을 가져옵니다.
            let oVizFrame = this.getView().byId("idViewChart");
            let oBinding = oVizFrame.getDataset().getBinding("data");
        
            // 필터를 적용합니다.
            oBinding.filter([oFilter]);
        }
        
    })
});
