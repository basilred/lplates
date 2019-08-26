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
      <input
        className="Input"
        placeholder="AA or 123"
        value={value}
        onChange={this.handleChange} />
    );
  }
}
