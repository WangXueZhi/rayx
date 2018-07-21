import React from 'react';
import {
  Picker
} from 'antd-mobile';
import ComponentBase from '../Common/ComponentBase';
import classnames from "classnames";
// 三级联动数据
import { district } from './District';

// import icon_position from './images/icon_position.png';
// import icon_edit from './images/icon_edit.png';

const CustomChildren = (props) => {
  return (
    <div onClick={props.onClick} className={props.className}>
      <div className={classnames("PositionPicker-wrapper", {
        "PositionPicker-hasValue": props.extra != props.title
      })}>
        {
          props.extra
        }
      </div>
    </div>
  )
  // return (<input type="text"
  //   placeholder={"省市区"}
  //   value={props.extra != "所在地区" ? props.extra : ""}
  //   onClick={props.onClick}
  //   readOnly
  // />)
};

class PositionPicker extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      asyncValue: props.value || []
    };
  }

  componentDidMount() {
    super.componentDidMount();

  }

  componentWillUnMount() {
    super.componentWillUnmount();
  }

  componentWillReceiveProps(nextProps) {
  }

  render() {
    return (
      <Picker
        className={this.props.PickerClassName}
        data={district}
        cols={this.props.cols}
        title={this.props.title}
        extra={this.props.title}
        value={this.state.asyncValue}
        onChange={(v) => {
          this.setState({
            asyncValue: v
          }, () => {
            this.props.onChange(v);
          })
        }}
      >
        {
          this.props.children || <CustomChildren className={this.props.ChildrenClassName} title={this.props.title} />
        }
      </Picker>
    );
  }
}

PositionPicker.defaultProps = {
  onChange: () => { },
  value: null,
  cols: 3
};

export default PositionPicker;
