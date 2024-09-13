import React from 'react';
import Bullet, {
    Font, Margin, Size, Tooltip,
} from 'devextreme-react/bullet';

const customizeTooltip = (data) => ({
    text: `${parseInt(data.value, 10)}%`,
});
const barChart = (cellData,guitsetgel) => (
    <div style={{flexDirection:'row',justifyContent:'space-between',display:'flex',alignItems:'center'}}>
        <Bullet
            showTarget={false}
            showZeroLevel={false}
            value={guitsetgel * 100 / cellData * 1}
            startScaleValue={0}
            endScaleValue={100}
        >
            <Size
                width={100}
                height={20}
            />
            <Margin
                top={5}
                bottom={0}
                left={5}
            />
            <Tooltip
                enabled={true}
                paddingTopBottom={2}
                zIndex={5}
                customizeTooltip={customizeTooltip}
            >
                <Font size={12} />
            </Tooltip>
        </Bullet>
        <span>{parseInt(guitsetgel * 100 / cellData * 1,10)}%</span>
    </div>


);
export default barChart;
