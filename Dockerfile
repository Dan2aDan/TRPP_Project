FROM python:3.11

RUN mkdir "/usr/src/app/"
EXPOSE 8000

WORKDIR /usr/src/app/

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV TZ=Europe/Moscow
RUN apt update
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN apt-get install python3-pip -y && pip install --upgrade pip && pip install pipenv
RUN pip install gunicorn
RUN mkdir -p /usr/src/app/
COPY requirements.txt /usr/src/app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

RUN mkdir -p /usr/src/app/
COPY . /usr/src/app/

