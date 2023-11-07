import tarfile
import docker
import os
import subprocess
import uuid
docker_client = docker.from_env()


language_ex = {'Python': 'py', 'Javascript': 'js', 'C': 'c'}
language_cmd = {'Python': 'python3',
                'Javascript': 'node', 'C': 'gcc -o executable'}


def run_user_code(code, language):
    file_name = str(uuid.uuid4())
    code_file_path = f'/docker_test/{file_name}.{language_ex[language]}'
    write_code_file(code_file_path, code)

    container = docker_client.containers.create(
        'code-execution-image', command='bash', detach=True, tty=True)
    container.start()

    container_path = f'/user-code/{file_name}.{language_ex[language]}'
    copy_to(code_file_path, container_path, container.id)

    if language != 'C':
        exec_info = container.exec_run(
            cmd=[language_cmd[language], container_path], workdir='/')
    else:
        compile_c_code(file_name, container.id)
        exec_info = container.exec_run(
            cmd=[f'./{file_name}', container_path], workdir='/user-code/')
    exec_output = exec_info.output
    output = exec_output.decode('utf-8')

    container.stop()
    container.remove()

    return (output)


def compile_c_code(file_name, container_id):
    command = f"gcc -w -o {file_name} /user-code/{file_name}.c"
    compile_command = f"docker exec {container_id} {command}"
    result = subprocess.run(compile_command, shell=True, stderr=subprocess.PIPE, stdout=subprocess.PIPE)

    if result.returncode == 0:
        print("Compilation successful")
    else:
        print("Compilation failed")
        print(result.stderr.decode('utf-8'))


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
