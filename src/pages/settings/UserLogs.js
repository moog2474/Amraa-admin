import React ,{useState} from 'react';
import DataGrid, {Column, SearchPanel, Paging, Pager, FilterRow} from "devextreme-react/data-grid";
import notify from "devextreme/ui/notify";
import styles from './settings.module.css';
import refService from "../../services/api/ref";
import {LoadPanel} from "devextreme-react/load-panel";
import {onCellPreparedHandler, operationDescriptions, resetOperationText, sortingText} from "../../util/index"
const UserLogs = () => {
    const [mainData, setMainData] = React.useState([]);
    const [loader, setLoader] = useState(false);

    React.useEffect(async () => {
        try {
            const logs = await refService.getAllLogs();
            setMainData(logs.data);
        } catch (e) {
            console.log(e, ' -> logs');
            return notify("Хэрэглэгчдийн нэвтрэлтийн мэдээлэл авхад алдаа гарлаа!");
        }
    }, []);

    const action = (cellData) => {
        const act = cellData.data.action_type;
        return (
            <div className={styles.actionType}>
                <p className={act.toLowerCase() === 'login' || act.toLowerCase() === 'нэвтрэх' ? styles.green : styles.red}>{act}</p>
            </div>
        )
    };

    const orderRender = (data) => {
        return <div>{data.rowIndex + 1}</div>
    }

    const time = (data) => {
        return <div>{data.data.updatedAt + ' ' + data.data.createdAt.slice(0, 8)}</div>
    }

    return (
        <div>
            <div className="col-12 row" style={{justifyContent: "center", gap: '2rem', padding: '5px 15px',marginBottom:20}}>
                <span>
                   ХЭРЭГЛЭГЧИЙН ХАНДАЛТЫН ЛОГ УДИРДАХ ХЭСЭГ
                </span>
            </div>
            <LoadPanel
                shadingColor="rgba(0,0,0,0.4)"
                position={{of: '#password'}}
                visible={loader}
                showPane={false}
                message="Түр хүлээнэ үү..."
            />
            <DataGrid
                dataSource={mainData}
                rowAlternationEnabled={true}
                allowColumnResizing={true}
                onCellPrepared={(e) => {
                    return onCellPreparedHandler(e);
                }}
                columnAutoWidth={true}
                showBorders={true}
                showRowLines={true}
                showColumnLines={true}
                showColumnHeaders={true}  sorting={sortingText}
            >
                <SearchPanel visible={false} highlightSearchText={true} />
                <FilterRow
                    visible={true} operationDescriptions={operationDescriptions} resetOperationText={resetOperationText}
                />
                <Pager
                    showPageSizeSelector={true}
                    showNavigationButtons={true}
                />
                <Column
                    cellRender = {orderRender}
                    caption="ID"
                    allowEditing = {false}
                    alignment="center"
                    width={60}
                />
                <Column
                    dataField="username"
                    caption="Хэрэглэгчийн нэр"
                    alignment="center"
                />
                <Column
                    caption="Нэвтэрсэн огноо"
                    alignment="center"
                    cellRender={time}
                    width={150}
                >
                    {/*<FilterRow visible={true}*/}
                    {/*           applyFilter={false} />*/}
                </Column>
                <Column
                    dataField="country_name"
                    caption="Улс"
                    alignment="center"
                />
                <Column
                    dataField="ipv4"
                    caption="IP хаяг"
                    alignment="center"
                />
                <Column
                    dataField="latitude"
                    caption="Уртраг"
                    alignment="center"
                />
                <Column
                    dataField="longitude"
                    caption="Өргөрөг"
                    alignment="center"
                />
                <Column
                    caption="Төлөв"
                    cellRender={action}
                    alignment="center"
                    width={500}
                />
                <Paging enabled={true} />
            </DataGrid>
        </div>
    )
};

export default UserLogs;