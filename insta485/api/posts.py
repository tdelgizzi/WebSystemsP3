"""REST API for posts."""
import sys
import flask
from flask import request
import insta485
from insta485.api.exception import InvalidUsage


@insta485.app.route('/api/v1/p/', methods=["GET"])
def get_newest_posts():
    """Return the 10 newest posts."""
    if "user" not in flask.session:
        raise InvalidUsage("Forbidden", 403)
    size = request.args.get('size', default=10, type=int)
    page = request.args.get('page', default=0, type=int)
    postid_lte = request.args.get('postid_lte', type=int)
    maxid = sys.maxsize
    if postid_lte:
        maxid = postid_lte
    # Both size and page must be non-negative integers
    if size < 0 or page < 0:
        raise InvalidUsage("Bad Request", 400)
    # Connect to database
    logname = flask.session['user']
    connection = insta485.model.get_db()
    # Query database
    cur = connection.execute(
        "SELECT a.postid as postid "
        "FROM (SELECT DISTINCT postid, filename, owner, created "
        "FROM (SELECT username2 FROM following "
        "WHERE username1 = ?) "
        "JOIN posts "
        "ON owner = username2 or owner = ? "
        "ORDER BY postid DESC) a "
        "INNER JOIN users u "
        "ON u.username = a.owner "
        "WHERE a.postid <= ? "
        "LIMIT ? OFFSET ?", (logname, logname, maxid, size, (page)*size)
    )
    post_query = cur.fetchall()
    results = []
    count = 0
    for post in post_query:
        cur_postid = post['postid']
        if postid_lte and cur_postid > postid_lte:
            continue
        if not count:
            min_val = cur_postid
        count += 1
        results.append({"postid": cur_postid,
                        "url": flask.url_for("get_post",
                                             postid_url_slug=cur_postid)})
    if count < size:
        next_url = ""
    else:
        if postid_lte:
            min_val = postid_lte
        next_url = flask.url_for("get_newest_posts",
                                 size=size,
                                 page=page+1,
                                 postid_lte=min_val)
    context = {
        "next": next_url,
        "results": results,
        "url": flask.request.path,
    }
    return flask.jsonify(**context)


@insta485.app.route('/api/v1/p/<int:postid_url_slug>/', methods=["GET"])
def get_post(postid_url_slug):
    """Return post on postid.

    Example:
    {
      "age": "2017-09-28 04:33:28",
      "img_url": "/uploads/122a7d27ca1d7420a1072f695d9290fad4501a41.jpg",
      "owner": "awdeorio",
      "owner_img_url": "/uploads/e1a7c5c32973862ee15173b0259e3efdb6a391af.jpg",
      "owner_show_url": "/u/awdeorio/",
      "post_show_url": "/p/1/",
      "url": "/api/v1/p/1/"
    }
    """
    if "user" not in flask.session:
        raise InvalidUsage("Forbidden", 403)
    connection = insta485.model.get_db()
    # Query database
    # If post does not exist, 404 error
    cur = connection.execute(
        "select  COUNT(*) FROM posts "
        "where postid = ?", (postid_url_slug, )
    )
    if not cur.fetchall()[0]["COUNT(*)"]:
        raise InvalidUsage("Not Found", 404)
    cur = connection.execute(
        "select  p.created as created, p.filename as img_url, "
        "p.owner as owner, "
        "u.filename as owner_img_url "
        "from posts p "
        "join users u "
        "on owner = username where postid = ?", (postid_url_slug, )
    )
    post_query = cur.fetchall()
    post_query = post_query[0]
    context = {
        "age": post_query["created"],
        "img_url": flask.url_for("show_uploads",
                                 filename=post_query['img_url']),
        "owner": post_query['owner'],
        "owner_img_url": flask.url_for("show_uploads",
                                       filename=post_query['owner_img_url']),
        "owner_show_url": flask.url_for("show_user",
                                        user_url_slug=post_query['owner']),
        "post_show_url": "/p/{}/".format(postid_url_slug),
        "url": flask.request.path,
    }
    return flask.jsonify(**context)
