import React, {useState} from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { parseJson } from './utils';
import './FormComponent.css';

const MAX_WEIGHT = 6;
const FormComponent = () => {
  const [validated, setValidated] = useState(undefined);
  const [treemapJson, setTreemapJson] = useState();
  const [rowNumber, setRowNumber] = useState();
  const [formErrors, setFormErrors] = useState({
    treemapJson: [],
    rowNumber: []
  });

  const handleOnChange = (e) => {
    // reset form state when input values are changed
    setValidated(undefined);

    switch(e.target.name) {
      case 'treemapJson':
        setTreemapJson(e.target.value);
        break;

      case 'rowNumber':
        setRowNumber(e.target.value ? parseInt(e.target.value) : '');
        break;

      default:
        break;
    }
  }

  const handleSubmit = (event) => {
    let errors = {
      treemapJson: [],
      rowNumber: []
    };
    let treemapArray;

    if (!treemapJson) {
      errors.treemapJson.push('treemapJson is required!');
    } else if (!parseJson(treemapJson)) {
      errors.treemapJson.push('json is invalid!');
    } else {
      treemapArray = parseJson(treemapJson);
      
      if (!Array.isArray(treemapArray) || treemapArray.length > 50) {
        errors.treemapJson.push('It must an array which cannot contain more than 50 items!');
      } else {
        treemapArray.forEach(item => {
          if (item && !item.name) {
            errors.treemapJson.push('property name is required!');
          } else if (typeof item.name !== 'string') {
            errors.treemapJson.push('name must be a string!');
          } else if (item.name.length > 50) {
            errors.treemapJson.push('name cannot more than 50 characters!');
          }

          if (item && !item.weight) {
            errors.treemapJson.push('property weight is required!');
          } else if (!Number.isInteger(item.weight)) {
            errors.treemapJson.push('weight must be an integer!');
          }
        })
      }
    }

    if (!rowNumber) {
      errors.rowNumber.push('rowNumber is required!')
    } else if (!Number.isInteger(rowNumber)) {
      errors.rowNumber.push('rowNumber must be an integer!');
    } else if (treemapArray && rowNumber > treemapArray.length) {
      errors.rowNumber.push('row number must be less than or equal to treemap array length!');
    }

    setValidated(errors.treemapJson.length === 0 && errors.rowNumber.length === 0);
    setFormErrors(errors);
  };

  const generateTreemap = () => {
    if (!treemapJson) {
      return;
    }

    let treemapArray = parseJson(treemapJson);
    if (Array.isArray(treemapArray) && treemapArray.length > 0) {
      let sortedArray = treemapArray.sort((a, b) => (a.weight < b.weight) ? 1 : -1);
      let row;
      let remainRectWidth;
      let treemapDetails = sortedArray.map((item, i) => {
        if (i === 0) {
          row = 0;
          remainRectWidth = MAX_WEIGHT - item.weight;
        } else if (remainRectWidth > 0 && remainRectWidth >= item.weight) {
          remainRectWidth = remainRectWidth - item.weight;
        } else {
          row = row + 1;
          remainRectWidth = MAX_WEIGHT - item.weight;
        }

        return {
          name: item.name,
          weight: item.weight,
          value: Math.round(item.value * 100).toFixed(2),
          row
        }
      });

      let cols;
      let rows = [];
      for (let i = 0; i < rowNumber; i++) {
        for (let j = 0; j < treemapDetails.length; j++) {
          cols = treemapDetails.filter(item => item.row === i);
        }

        rows.push(
          <Row key={`row${i}`}>
            {
              cols.map((item, index) => 
                <Col key={`col${index}`} xs={item.weight*2} className={item.value > 0 ? "rect green" : "rect red"} style={{border: "1px solid black"}}>
                  <div className="rect-name">{item.name}</div>
                  <div>{item.value}%</div>
                </Col>
              )
            }
          </Row>
        );
      }
      return (
        <div>
          <div>Result:</div>
          <Container style={{background: "white", padding: "0 0.75rem"}}>{rows}</Container>
        </div>
      )
    }
  };

  return (
   <Container>
      <Row>
        <Col xs={6}>
          <Form noValidate validated={validated}>
            <Form.Group className="mb-3" controlId="form.treemapJson">
              <Form.Label>Treemap json:</Form.Label>
              <Form.Control 
                name="treemapJson" 
                as="textarea" 
                placeholder="Input treemap json"
                rows={10} 
                onChange={(event) => handleOnChange(event)} 
                value={treemapJson}
                isInvalid={validated !== undefined && formErrors.treemapJson.length > 0}
                isValid={validated !== undefined && formErrors.treemapJson.length === 0}
              />
              <Form.Control.Feedback type={formErrors.treemapJson.length > 0 ? "invalid" : "valid"}>
                <ul className="formError">
                  {formErrors.treemapJson.map((error, i) => {
                    return <li key={`treemapJson${i}`}>{error}</li>
                  })}
                </ul>
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="form.rowNumber">
              <Form.Label>Row number:</Form.Label>
              <Form.Control 
                name="rowNumber" 
                type="input" 
                placeholder="Enter row number" 
                onChange={(event) => handleOnChange(event)} 
                value={rowNumber}
                isInvalid={validated !== undefined && formErrors.rowNumber.length > 0}
                isValid={validated !== undefined && formErrors.rowNumber.length === 0}
              />
              <Form.Control.Feedback type={formErrors.rowNumber.length > 0 ? "invalid" : "valid"}>
                <ul className="formError">
                  {formErrors.rowNumber.map((error, i) => {
                    return <li key={`rowNumber${i}`}>{error}</li>
                  })}
                </ul>
              </Form.Control.Feedback>
            </Form.Group>
            <Button type="button" onClick={(event) => handleSubmit(event)}>Generate Treemap</Button>
          </Form>
        </Col>
        <Col xs={6}>{validated ? generateTreemap() : <div></div>}</Col>
      </Row>
   </Container>
 )};


export default FormComponent;