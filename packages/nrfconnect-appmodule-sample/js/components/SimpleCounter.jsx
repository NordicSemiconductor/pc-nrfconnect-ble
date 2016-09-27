import React, { PropTypes } from 'react';
import { Button } from 'react-bootstrap';

export default class SimpleCounter extends React.PureComponent {
    static propTypes = {
        value: PropTypes.number.isRequired,
        onIncrement: PropTypes.func.isRequired
    };

    render() {
        const { value, onIncrement } = this.props;

        return (
            <div>
                <p>Value: { value }</p>
                <Button onClick={onIncrement}>Increment</Button>
            </div>
        );
    }
}
