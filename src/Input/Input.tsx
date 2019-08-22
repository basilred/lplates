import React, { ChangeEvent } from 'react';

interface InputProps {
  value?: string;
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
    this.setState({ value: e.target.value });
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
