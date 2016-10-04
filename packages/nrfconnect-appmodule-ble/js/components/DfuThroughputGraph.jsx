/* Copyright (c) 2016 Nordic Semiconductor. All Rights Reserved.
 *
 * The information contained herein is property of Nordic Semiconductor ASA.
 * Terms and conditions of usage are described in detail in NORDIC
 * SEMICONDUCTOR STANDARD SOFTWARE LICENSE AGREEMENT.
 *
 * Licensees are granted free, non-transferable use of the information. NO
 * WARRANTY of ANY KIND is provided. This heading must NOT be removed from
 * the file.
 *
 */

import React, { PropTypes } from 'react';
import sizeMe from 'react-sizeme';
import { LineChart } from 'react-d3-components';
import d3 from 'd3';

const HEIGHT = 250;
const MARGIN = {
    top: 10,
    bottom: 30,
    left: 30,
    right: 0,
};

class DfuThroughputGraph extends React.PureComponent {

    static propTypes = {
        totalSizeKb: PropTypes.number.isRequired,
        kbpsPoints: PropTypes.arrayOf(PropTypes.shape({
            x: PropTypes.number,
            y: PropTypes.number,
        })).isRequired,
        averageKbpsPoints: PropTypes.arrayOf(PropTypes.shape({
            x: PropTypes.number,
            y: PropTypes.number,
        })).isRequired
    };

    static createGraphData(kbpsPoints, averageKbpsPoints) {
        return [{
            label: 'average kB/s',
            values: averageKbpsPoints
        }, {
            label: 'kB/s',
            values: kbpsPoints
        }];
    }

    static createXScale(totalSizeKb, width) {
        const linearScale = d3.scale.linear();
        return linearScale.domain([0, totalSizeKb]).range([0, width - MARGIN.left - 1]);
    }

    getWidth() {
        // The size prop is added by react-sizeme
        const size = this.props.size;
        const fallbackWidth = 400;
        return size ? size.width : fallbackWidth;
    }

    render() {
        const { totalSizeKb, kbpsPoints, averageKbpsPoints } = this.props;
        const width = this.getWidth();

        if (kbpsPoints.length > 0) {
            return (
                <LineChart
                    data={DfuThroughputGraph.createGraphData(kbpsPoints, averageKbpsPoints)}
                    width={width}
                    height={HEIGHT}
                    xScale={DfuThroughputGraph.createXScale(totalSizeKb, width)}
                    xAxis={{label: "kB transferred"}}
                    margin={MARGIN}
                />
            );
        }
        return null;
    }
}

// Wrap the component inside a react-sizeme higher order component (HOC). Makes
// the component aware of its size, so that the graph can be resized dynamically.
export default sizeMe()(DfuThroughputGraph);