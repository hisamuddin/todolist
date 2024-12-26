import React from 'react';
import { Breadcrumb } from 'react-bootstrap';

const Breadcrumbs = () => {
    return (
        <Breadcrumb>
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Item active>Todo List</Breadcrumb.Item>
        </Breadcrumb>
    );
};

export default Breadcrumbs;