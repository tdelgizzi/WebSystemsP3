"""REST API for retrieving resources."""
import flask
import insta485


@insta485.app.route('/api/v1/', methods=["GET"])
def get_services():
    """Return list of services available."""
    # The following code is irrelevant to the implementation,
    # just to avoid compiler problems
    context = {
        "posts": flask.url_for("get_newest_posts"),
        "url": flask.request.path
    }
    return flask.jsonify(**context)
