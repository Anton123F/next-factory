from worker import app


@app.task(name="tasks.video.transcode")
def transcode_video(video_id: str, input_path: str) -> None:
    # todo: implement FFmpeg HLS transcoding
    pass
