# Use a base image with Linux and basic development tools
FROM ubuntu:latest

# Update package lists
RUN apt-get update

# Install essential development tools
RUN apt-get install -y build-essential

# Install Node.js and npm for JavaScript
RUN apt-get install -y nodejs npm

# Install Python and pip for Python code
RUN apt-get install -y python3 python3-pip
RUN pip3 install --upgrade pip

# Set the working directory
WORKDIR /user-code
