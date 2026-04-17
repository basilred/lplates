import React, { ChangeEvent } from 'react';
import './Input.css';

interface InputProps {
  value?: string;
  onChange: (val: string) => void;
};

interface InputState {
  value: string;
};

export default class Input extends React.Component<InputProps, InputState> {
  constructor(props: InputProps) {
    super(props);

    this.state = {
      value: props.value || '',
    };
  }

  handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    this.setState({ value });
    this.props.onChange(value);
  }

  render() {
    const { value } = this.state;

    return (
      <div className="InputWrap">
        <span className="InputIcon" aria-hidden="true">
          /
        </span>
        <input
          className="Input"
          placeholder="Type a code: AA, AK, 77, 178"
          value={value}
          onChange={this.handleChange}
        />
        <span className="InputShortcut" aria-hidden="true">
          Enter
        </span>
      </div>
    );
  }
}
