import _ from 'underscore';

var AddNewItem = React.createClass({
    render: function() {
        let bars = _.times(parseInt(this.props.bars), i => <div className={"bar" + (i+1)} key={i}></div>);
        return (
            <div className="add-new content-wrap">
                {bars}
                <div className="icon-wrap"><i className="icon-slim icon-plus-circled"></i></div>
                <div className="content">
                    <span>{this.props.text}</span>
                </div>
            </div>
        );
    }
});

module.exports = AddNewItem;