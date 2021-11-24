import React from 'react';
import { bool, func } from 'prop-types';
import styled from 'styled-components';

const Burger = ({ open, setOpen, ...props }) => {
  const isExpanded = open ? true : false;
  return (
    <StyledBurger
      aria-label="PopCorn Toggle menu"
      aria-expanded={isExpanded}
      open={open}
      onClick={() => setOpen(!open)}
      {...props}
    >
      <div />
      <div />
      <div />
    </StyledBurger>
  );
};

Burger.propTypes = {
  open: bool.isRequired,
  setOpen: func.isRequired,
};

export default Burger;

export const StyledBurger = styled.button`
  position: absolute;
  top: ${({ open }) => (open ? '3%' : '15%')};
  right: ${({ open }) => (open ? '5%' : '2rem')};
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 20;
  @media (max-width: 680px) {
    right: ${({ open }) => (open ? '4%' : '2rem')};
  }

  @media (max-width: 480px) {
    right: ${({ open }) => (open ? '3%' : '2rem')};
  }

  &:focus {
    outline: none;
  }

  div {
    width: ${({ open }) => (open ? '1.2rem' : '2rem')};
    height: ${({ open }) => (open ? '0.15rem' : '0.25rem')};
    background: ${({ theme, open }) =>
      open ? theme.primaryDark : theme.primaryLight};
    border-radius: 10px;
    transition: transform 0.5s;
    position: relative;
    transform-origin: 1px;

    :first-child {
      background: ${({ open }) => (open ? '#000' : '#000')};
      transform: ${({ open }) => (open ? 'rotate(45deg)' : 'rotate(0)')};
      top: ${({ open }) => (open ? '9px' : '0')};
    }

    :nth-child(2) {
      background: #000;
      opacity: ${({ open }) => (open ? '0' : '1')};
      transform: ${({ open }) => (open ? 'translateX(20px)' : 'translateX(0)')};
    }

    :nth-child(3) {
      background: ${({ open }) => (open ? '#000' : '#000')};
      transform: ${({ open }) => (open ? 'rotate(-45deg)' : 'rotate(0)')};
    }
  }
`;
