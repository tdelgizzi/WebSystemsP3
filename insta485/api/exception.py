"""Return exceptions for REST API."""
from flask import jsonify
import insta485


class InvalidUsage(Exception):
    """Invalid Usage class."""

    status_code = 400

    def __init__(self, message, status_code=None, payload=None):
        """Initialize exception."""
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        """Set exception information."""
        r_val = dict(self.payload or ())
        r_val['message'] = self.message
        r_val['status_code'] = self.status_code
        return r_val


@insta485.app.errorhandler(InvalidUsage)
def handle_invalid_usage(error):
    """Handle errors."""
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response
