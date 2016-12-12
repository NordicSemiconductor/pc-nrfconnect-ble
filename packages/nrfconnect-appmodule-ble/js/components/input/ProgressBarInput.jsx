import React, { PropTypes } from 'react';
import { FormGroup, ControlLabel, ProgressBar, InputGroup } from 'react-bootstrap';

export default class ProgressBarInput extends React.PureComponent {
    static propTypes = {
        id: PropTypes.string,
        label: PropTypes.string,
        status: PropTypes.string,
        progressLabel: PropTypes.string,
        labelClassName: PropTypes.string,
        wrapperClassName: PropTypes.string
    };

    static defaultProps = {
        labelClassName: 'col-md-3 text-right',
        wrapperClassName: 'col-md-9'
    };

    render() {
        const { id, label, progressLabel, labelClassName, wrapperClassName, status, ...props } = this.props;

        return (
            <FormGroup controlId={id}>
                {
                    label && <ControlLabel className={labelClassName}>{label}</ControlLabel>
                }
                <InputGroup className={wrapperClassName}>
                    { status && <p>{status}</p>}
                    <ProgressBar label={progressLabel} {...props} />
                </InputGroup>
            </FormGroup>
        );
    }
}
