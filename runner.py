import tarfile
import docker
import os
docker_client = docker.from_env()


language_ex = {'Python': 'py', 'Javascript': 'js', 'C': 'c'}
language_cmd = {'Python': 'python3',
                'Javascript': 'node', 'C': 'gcc -o executable'}


def run_user_code(code, language):
    code_file_path = '/docker_test/new_file.' + language_ex[language]
    write_code_file(code_file_path, code)

    container = docker_client.containers.create(
        'code-execution-image', command='bash', detach=True, tty=True)
    container.start()

    container_path = '/user-code/new_file.' + language_ex[language]
    copy_to(code_file_path, container_path, container.id)

    if language != 'C':
        exec_info = container.exec_run(
            cmd=[language_cmd[language], container_path], workdir='/')
    else:
        container.exec_run(
            cmd=[language_cmd[language], container_path], workdir='/')
        exec_info = container.exec_run(
            cmd=[f'./executable', container_path], workdir='/user-code/')
    exec_output = exec_info.output
    output = exec_output.decode('utf-8')

    container.stop()
    container.remove()

    return (output)


def copy_to(src, dst, name):
    container = docker_client.containers.get(name)

    os.chdir(os.path.dirname(src))
    srcname = os.path.basename(src)
    tar = tarfile.open(src + '.tar', mode='w')
    try:
        tar.add(srcname)
    finally:
        tar.close()

    data = open(src + '.tar', 'rb').read()
    container.put_archive(os.path.dirname(dst), data)


def write_code_file(file_path, user_code):
    with open(file_path, 'w') as code_file:
        code_file.write(user_code)
