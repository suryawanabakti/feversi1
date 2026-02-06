import Button from "react-bootstrap/Button";
import { Spinner } from "react-bootstrap";

const ButtonPrimary = (props) => {
  return (
    <>
      <Button variant="danger" type="submit" disabled={props.disabled}>
        {props.loading ? (
          <>
            <Spinner
              as="span"
              animation="grow"
              size="sm"
              role="status"
              aria-hidden="true"
            />
            Loading...
          </>
        ) : (
          props.title
        )}
      </Button>
    </>
  );
};

export default ButtonPrimary;
