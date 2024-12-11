sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
],
    function (Controller, MessageBox, MessageToast) {
        "use strict";

        return Controller.extend("ztbsd0010.controller.Main", {
            onSelectionChange: function (event) {
                let sPath = event.getParameter("listItem").getBindingContext().getPath();
                this.getView().byId("tabItem").bindElement(sPath);
            },
            sopStatus: function (status) {
                switch (status) {
                    case 1:
                        return "진행중"
                    case 2:
                        return "취소"
                    case 3:
                        return "중단"
                    case 4:
                        return "완료"
                    default:
                        return "필요"
                }
            },
            availableState : function (status) {
                switch (status) {
                    case 1:
                        return 8
                    case 2:
                        return 3
                    case 3:
                        return 5
                    case 4:
                        return 7
                    default:
                        return 9
                }
            },
            apprIcon: function (status) {
                switch (status) {
                    case 1:
                        return "sap-icon://message-success"; // 승인
                    case 2:
                        return "sap-icon://accept"; // 최종승인
                    default:
                        return "sap-icon://decline"; // 미승인
                }
            },
            apprColor: function (status) {
                switch (status) {
                    case 1:
                        return "Critical"; // 승인
                    case 2:
                        return "Positive"; // 최종승인
                    default:
                        return "Negative"; // 미승인
                }
            },
            rej_enable: function (status) {
                let btn = this.getView().byId('rej_bth');
                if (status == "") {
                    btn.setEnabled = 'false'
                } else {
                    btn.setEnabled = true
                    return '반려사유'
                }
            },
            comboBoxChange: function (ev) {
                let year = ev.getSource().getSelectedKey();
                let oFilter = new sap.ui.model.Filter(
                    "Salesyear",
                    sap.ui.model.FilterOperator.EQ,
                    year
                )

                let oTable = this.getView().byId("tabHeader");
                let oBinding = oTable.getBinding("items");
                if (oBinding) {
                    oBinding.filter([oFilter]); // 필터를 적용
                    this.byId("tabItem").removeAllItems()
                }
                // SOP_HEADERSet(Sopnum='SOP0000123',Ctrycode='KR')/Sopnum_data
            },
            onRejButtonPress: function (event) {
                let oItem = event.getSource().getBindingContext().getPath();
                let oModel = this.getView().getModel();
                let data = oModel.getProperty(oItem);
                if (data.Rejreason == '') return false
                this.onRejMessageBox(data.Rejreason)
            },
            onRejMessageBox: function (msg) {
                MessageBox.information(msg);
            },
            onValueHelprequest: function (event) {
                this._sopId = event.getSource().getId();
                if (!this._oValueHelpDialog) {
                    this._oValueHelpDialog = sap.ui.xmlfragment(
                        "ztbsd0010.view.shSop",
                        this
                    );
                    this.getView().addDependent(this._oValueHelpDialog);
                }
                this._oValueHelpDialog.open();
            },
            onValueHelpClose: function (oEvent) {
                let oSelectedItem = oEvent.getParameter('selectedItem');
                if (oSelectedItem) {
                    let oInput = this.getView().byId(this._sopId);
                    oInput.setValue(oSelectedItem.getTitle());

                }
            },
            onSearch: function () {
                let sopNumId = this.getView().byId("sopNumId").getValue();
                let oFilter = new sap.ui.model.Filter(
                    "Sopnum",
                    sap.ui.model.FilterOperator.EQ,
                    sopNumId
                )

                let oTable = this.getView().byId("tabHeader");
                let oBinding = oTable.getBinding("items");
                if (oBinding) {
                    oBinding.filter([oFilter]); // 필터를 적용
                    this.byId("tabItem").removeAllItems()
                }
            },
            updateC : function () {     // 반려인 경우
                if (!this.update_validation()) return
                this.onRejectDialogPress()
            },
            update_validation : function () {
                let oTable = this.byId("tabHeader");
                let aSelectedIndices = oTable.getSelectedItem()

                if (!aSelectedIndices) {
                    MessageToast.show("라인을 선택하세요.");
                    return false;
                }

                let sop_status = aSelectedIndices.getBindingContext().getProperty('Status')
                let appr_status = aSelectedIndices.getBindingContext().getProperty('Appr')

                console.log('appr_status', appr_status)

                if (appr_status === 2) {
                    MessageToast.show("이미 최종승인된 문서가 있습니다.");
                    return false;
                }

                if (sop_status === 1) {
                    MessageToast.show("이미 생산이 진행중입니다.");
                    return false;
                }

                return true
            },
            update_check: function (status) {    // 승인인 경우
                if (!this.update_validation()) return
                let appr = 1    
                let sstatus = 0
                if (status == 'S') {
                    appr = 0
                    sstatus = 3
                }

                let oUpdateData = {
                    Appr: appr,
                    Status : sstatus,
                }

                this.update(oUpdateData)
            },
            update: async function (oUpdateData) {

                let oTable = this.byId("tabHeader");
                let aSelectedIndices = oTable.getSelectedItem()

                let sPath = aSelectedIndices.getBindingContextPath()
                let oModel = this.getView().getModel();

                // 경로, 변경될 데이터, 결과 처리
                try {
                    // Promise를 사용하여 비동기 처리를 수행
                    await new Promise((resolve, reject) => {
                        oModel.update(sPath, oUpdateData, {
                            method: "PUT",
                            success: function () {
                                // 성공 메시지
                                MessageToast.show("성공적으로 결재 처리되었습니다.");
                                resolve(); // 성공적으로 처리되었음을 알림
                            },
                            error: function () {
                                // 오류 메시지
                                MessageToast.show("결재에 실패했습니다.");
                                reject(new Error("Update failed")); // 오류 발생 시 reject 호출
                            }
                        });
                    });
                    // 성공적으로 처리된 후 추가 작업 수행 가능
                    console.log("업데이트가 완료되었습니다.");
                } catch (error) {
                    // 오류 처리
                    console.error("업데이트 중 오류 발생:", error);
                }
                window.location.reload();
                // https://ui5.sap.com/1.71.72/#/entity/sap.m.Table/sample/sap.m.sample.TableMergeCells
            },
            onRefresh: function () {
                this.byId("tabItem").refreshItems
                window.location.reload();
            },
            onRejectDialogPress: function () {
                if (this.oRejectDialog) {
                    this.oRejectDialog.open();
                }

                // 라이브러리 가져오기
                let ButtonType = sap.m.ButtonType;
                let DialogType = sap.m.DialogType;

                this.oRejectDialog = new sap.m.Dialog({
                    title: "반려",
                    type: DialogType.Message,
                    content: [
                        new sap.m.Label({
                            text: "반려 하시겠습니까?",
                            labelFor: "submissionNote" // ID를 입력합니다
                        }),
                        new sap.m.TextArea("submissionNote", {
                            width: "100%",
                            placeholder: "Add note (required)",
                            liveChange: function (oEvent) {
                                var sText = oEvent.getParameter("value");
                                this.oRejectDialog.getBeginButton().setEnabled(sText.length > 0);
                            }.bind(this)
                        })
                    ],
                    beginButton: new sap.m.Button({
                        type: ButtonType.Emphasized,
                        text: "확인",
                        press: function () {
                            let sText = sap.ui.getCore().byId("submissionNote").getValue(); // ID를 맞춰서 텍스트를 가져옵니다
                            MessageToast.show("Note is: " + sText);
                            this.oRejectDialog.close();
                            let oUpdateData = {
                                Appr: 0,
                                Status : 2,      // 취소
                                Rejreason : sText // 반려 사유
                            };
                            this.update(oUpdateData)
                        }.bind(this)
                    }),
                    endButton: new sap.m.Button({
                        text: "취소",
                        press: function () {
                            this.oRejectDialog.close();
                            return false;
                        }.bind(this)
                    })
                });
                this.oRejectDialog.open();
            },
        });
    });