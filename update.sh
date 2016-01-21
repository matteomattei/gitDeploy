#!/bin/bash

set -e

function func_exit(){
    echo "${1}" >&2
    exit 1
}

repo_name=""
bare_repo=""
repository_url=""
repository_url_basename=""
branch=""
working_repo=""
destination=""
timeout="600"
user=""
postcmd=""

DEBUG="false"

while getopts ":r:b:u:a:n:w:d:t:i:c:" opt; do
    case $opt in
        r)
            [ "${DEBUG}" = "true" ] && echo "-r (repo_name), Parameter: $OPTARG" >&2
            repo_name="${OPTARG}"
            ;;
        b)
            [ "${DEBUG}" = "true" ] && echo "-b (bare_name), Parameter: $OPTARG" >&2
            bare_repo="${OPTARG}"
            ;;
        u)
            [ "${DEBUG}" = "true" ] && echo "-u (repository_url), Parameter: $OPTARG" >&2
            repository_url="${OPTARG}"
            ;;
        a)
            [ "${DEBUG}" = "true" ] && echo "-a (repository_url_basename), Parameter: $OPTARG" >&2
            repository_url_basename="${OPTARG}"
            ;;
        n)
            [ "${DEBUG}" = "true" ] && echo "-n (branch), Parameter: $OPTARG" >&2
            branch="${OPTARG}"
            ;;
        w)
            [ "${DEBUG}" = "true" ] && echo "-w (working_repo), Parameter: $OPTARG" >&2
            working_repo="${OPTARG}"
            ;;
        d)
            [ "${DEBUG}" = "true" ] && echo "-d (destination), Parameter: $OPTARG" >&2
            destination="${OPTARG}"
            ;;
        t)
            [ "${DEBUG}" = "true" ] && echo "-t (timeout), Parameter: $OPTARG" >&2
            timeout="${OPTARG}"
            ;;
        i)
            [ "${DEBUG}" = "true" ] && echo "-i (user), Parameter: $OPTARG" >&2
            user="${OPTARG}"
            ;;
        c)
            [ "${DEBUG}" = "true" ] && echo "-c (postcmd), Parameter: $OPTARG" >&2
            postcmd="${OPTARG}"
            ;;
        \?)
            echo "Invalid option: -$OPTARG" >&2
            exit 1
            ;;
        :)
            echo "Option -$OPTARG requires an argument." >&2
            exit 1
            ;;
    esac
done

[ -z "${repo_name}" ] && func_exit "Missing repo_name (-r)"
[ -z "${bare_repo}" ] && func_exit "Missing bare_repo (-b)"
[ -z "${repository_url}" ] && func_exit "Missing repository_url (-u)"
[ -z "${repository_url_basename}" ] && func_exit "Missing repository_url_basename (-a)"
[ -z "${branch}" ] && func_exit "Missing branch (-n)"
[ -z "${working_repo}" ] && func_exit "Missing working_repo (-w)"
[ -z "${destination}" ] && func_exit "Missing destination (-d)"
[ -z "${user}" ] && func_exit "Missing user (-i)"

if [ "${DEBUG}" = "true" ]; then
    echo "repo_name=${repo_name}"
    echo "bare_repo=${bare_repo}"
    echo "repository_url=${repository_url}"
    echo "repository_url_basename=${repository_url_basename}"
    echo "branch=${branch}"
    echo "working_repo=${working_repo}"
    echo "destination=${destination}"
    echo "timeout=${timeout}"
    echo "user=${user}"
    echo "postcmd=${postcmd}"
fi

(
flock -x -w ${timeout} 200 || exit 1
su - ${user} <<EOF
    [ -d ${destination} ] || mkdir -p ${destination}
    if [ ! -d ${working_repo} ]; then
        mkdir -p ${bare_repo}
        cd ${bare_repo}
        /usr/bin/git clone --mirror ${repository_url}
        /bin/mv ${repository_url_basename} ${repo_name}
        cd ${repo_name}
        GIT_WORK_TREE=${destination} /usr/bin/git checkout -f ${branch}
    fi

    cd ${working_repo}
    /usr/bin/git fetch
    GIT_WORK_TREE=${destination} /usr/bin/git checkout -f
    if [ ! -z "${postcmd}" ]; then
        cd ${destination}
        eval ${postcmd} > /dev/null 2>&1
    fi
EOF
) 200>/tmp/gitDeploy-${repository_url_basename}.lock
exit 0
