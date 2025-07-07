from facenet_pytorch import MTCNN, InceptionResnetV1
from PIL import Image
import os, torch
from sklearn.metrics import accuracy_score, classification_report
from tqdm import tqdm
import warnings
warnings.filterwarnings("ignore")

# 🚀 Setup
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
mtcnn = MTCNN(image_size=160, margin=0, device=device)
resnet = InceptionResnetV1(pretrained='vggface2').eval().to(device)

data_dir = 'dataset'  # Folder from your shared dataset

# 🎓 Build one-shot training DB
embedding_db = {}
test_data = []

for person in os.listdir(data_dir):
    p_dir = os.path.join(data_dir, person)
    imgs = sorted([f for f in os.listdir(p_dir) if f.lower().endswith(('.jpg','.png'))])
    if len(imgs) < 2: continue

    # Reference image
    img_ref = Image.open(os.path.join(p_dir, imgs[0]))
    face_ref = mtcnn(img_ref)
    if face_ref is None: continue

    emb_ref = resnet(face_ref.unsqueeze(0).to(device)).detach()
    embedding_db[person] = emb_ref

    # Test images
    for t in imgs[1:]:
        test_data.append((person, os.path.join(p_dir, t)))

# 🧪 Inference
y_true, y_pred = [], []
for true_name, img_path in tqdm(test_data):
    img = Image.open(img_path)
    face = mtcnn(img)
    if face is None: continue

    emb = resnet(face.unsqueeze(0).to(device)).detach()
    best_sim, best_name = -1, None
    for name, db_emb in embedding_db.items():
        sim = torch.nn.functional.cosine_similarity(emb, db_emb).item()
        if sim > best_sim:
            best_sim, best_name = sim, name

    y_true.append(true_name)
    y_pred.append(best_name)

# 🔍 Metrics
print("\n📊 Metrics for Dataset:")
print(classification_report(y_true, y_pred))
print(f"✅ Accuracy: {accuracy_score(y_true, y_pred)*100:.2f}%")
