import React from 'react';
import DataGrid, {
    Column, Grouping, GroupPanel,
    Paging,
    Scrolling, SearchPanel,
    Selection,
} from 'devextreme-react/data-grid';
import DropDownBox from 'devextreme-react/drop-down-box';
import {FilterRow} from "devextreme-react/tree-list";
import ScrollView from "devextreme-react/scroll-view";

const dropDownOptions = { width: 1200 };

export default class WorkerDropDownBoxComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedRowKeys: [props.data.value],
            isDropDownOpened: false,
        };
        this.onSelectionChanged = this.onSelectionChanged.bind(this);
        this.contentRender = this.contentRender.bind(this);
        this.boxOptionChanged = this.boxOptionChanged.bind(this);
    }

    boxOptionChanged(e) {
        if (e.name === 'opened') {
            this.setState({
                isDropDownOpened: e.value,
            });
        }
    }
    contentRender() {
        return (
            <ScrollView width='100%' height='100%'>
            <DataGrid
                dataSource={this.props.data.column.lookup.dataSource}
                //remoteOperations={true}
                height={500}
                keyExpr="id"
                selectedRowKeys={this.state.selectedRowKeys}
                hoverStateEnabled={true}
                onSelectionChanged={this.onSelectionChanged}
                focusedRowEnabled={true}
                defaultFocusedRowKey={this.state.selectedRowKeys[0]}
            >
                <GroupPanel visible={true}/>
                <SearchPanel visible={true}/>
                <Grouping autoExpandAll={false}/>
                <FilterRow
                    visible={true}
                />
                <Column dataField="department_name"  caption="Алба хэлтэс" groupIndex={0}/>
                <Column dataField="position_name"  caption="Албан тушаал"/>
                <Column dataField="worker_status_name"  caption="Ажилтаны төлөв"/>
                <Column dataField="last_name" caption="Овог"/>
                <Column dataField="first_name" caption="Нэр"/>
                <Column dataField="email" caption="Имэйл хаяг"/>
                <Column dataField="mobile" caption="Утас"/>
                <Paging enabled={true}/>
                <Scrolling mode="virtual" />
                <Selection mode="single" />
            </DataGrid>
            </ScrollView>
        );
    }

    onSelectionChanged(selectionChangedArgs) {
        this.setState({
            selectedRowKeys: selectionChangedArgs.selectedRowKeys,
            isDropDownOpened: false,
        });
        this.props.data.setValue(this.state.selectedRowKeys[0]);
    }

    render() {
        return (
            <DropDownBox
                onOptionChanged={this.boxOptionChanged}
                opened={this.state.isDropDownOpened}
                dropDownOptions={dropDownOptions}
                dataSource={this.props.data.column.lookup.dataSource}
                value={this.state.selectedRowKeys[0]}
                displayExpr="display_name"
                valueExpr="id"
                contentRender={this.contentRender}>
            </DropDownBox>
        );
    }
}
