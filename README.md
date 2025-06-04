# Publishing a Dag

To publish a dag, simply use the github action as part of your pipeline:

```yaml
- name: Publish Dag
  uses: serv-c/servc-publish-action
  if: github.ref_name == 'main'
  with:
    api_token: ${{ secrets.API_TOKEN }}

    # OPTIONAL:
    # dag_json: dag.json                # location of the dag to publish
    # api_url: https://api.servc.io     # the api endpoint to push to
    # python_version: 3.13              # the python version to use for publishing
```