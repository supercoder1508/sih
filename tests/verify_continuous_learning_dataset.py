import sys
from pathlib import Path
root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir))
sys.path.insert(0, str(root_dir / 'backend'))
sys.path.insert(0, str(root_dir / 'backend' / '01_preprocessing'))
sys.path.insert(0, str(root_dir / 'backend' / '02_models'))
sys.path.insert(0, str(root_dir / 'backend' / '03_explainability'))
sys.path.insert(0, str(root_dir / 'backend' / '04_prescriptive'))
sys.path.insert(0, str(root_dir / 'backend' / '05_monitoring'))
sys.path.insert(0, str(root_dir / 'backend' / '06_mlops'))
sys.path.insert(0, str(root_dir / 'backend' / '07_api'))

import importlib
import pandas as pd
import json
import time

def test_continuous_learning_dataset():
    cl = importlib.import_module('continuous_learning')

    timestamp_str = str(int(time.time() * 1000))
    test_rec = {
        'project_id': f'TEST-AUTO-{timestamp_str}',
        'project_name': 'Automated Test Corridor',
        'state': 'Gujarat',
        'district': 'Ahmedabad',
        'project_type': 'Highway',
        'terrain_type': 'Plain',
        'land_area_hectares': 75.0,
        'estimated_cost_inr_crore': 450.0,
        'affected_families_count': 120,
        'title_dispute_rate_percent': 3.5,
        'local_protest_flag': False,
        'compensation_multiplier_demand': 1.25,
        'sia_approval_status': 'Approved',
        'section_11_notification_days': 45,
        'forest_clearance_status': 'Not_Required',
        'fund_disbursement_percent': 40.0
    }

    res = cl.ingest_new_projects([test_rec])
    print('Ingest result:', res)

    csv1 = len(pd.read_csv('indian_infrastructure_projects_dataset.csv'))
    csv2 = len(pd.read_csv('data/indian_infrastructure_projects_dataset.csv'))
    csv3 = len(pd.read_csv('dashboard/data/indian_infrastructure_projects_dataset.csv'))

    print(f'CSV row counts: root={csv1}, data={csv2}, dashboard/data={csv3}')
    assert csv1 == csv2 == csv3, f'Mismatch in CSV counts: {csv1}, {csv2}, {csv3}'

    with open('data/model_health.json') as f:
        h1 = json.load(f)
    with open('dashboard/data/model_health.json') as f:
        h2 = json.load(f)

    print(f'Model health training_size: {h1.get("training_size")} and {h2.get("training_size")}')
    assert h1.get('training_size') == csv1
    assert h2.get('training_size') == csv1

    # Check projects_stats.json
    with open('data/projects_stats.json') as f:
        s1 = json.load(f)
    with open('dashboard/data/projects_stats.json') as f:
        s2 = json.load(f)
    print(f'Projects stats total_projects: {s1.get("total_projects")} and {s2.get("total_projects")}')
    assert s1.get('total_projects') == csv1
    assert s2.get('total_projects') == csv1

    # Check geo json
    with open('data/projects_geo.json') as f:
        geo1 = json.load(f)
    matching_geo = [g for g in geo1 if g.get('project_id') == test_rec['project_id']]
    assert len(matching_geo) == 1, 'Project not found in data/projects_geo.json'

    print('ALL CONTINUOUS LEARNING DATASET STORAGE CHECKS PASSED!')

if __name__ == '__main__':
    test_continuous_learning_dataset()
