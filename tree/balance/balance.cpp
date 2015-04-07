#include <cstdio>
#include <vector>
#include <array>
#include <sstream>
#include <iostream>
#include <cmath>
#include <iomanip>
#include <fstream>

using namespace std;

static const size_t dimensions = 2;

template <typename T>
string attr(string name, T value) {
	ostringstream os;
	os << name << "=\"" << value << "\" ";
	return os.str();
}

template <typename T>
string json_field(string name, T value) {
	ostringstream os;
	os << "\"" << name << "\": " << value;
	return os.str();
}

string json_field(string name, string value) {
	ostringstream os;
	os << "\"" << name << "\":\"" << value << "\"";
	return os.str();
}

string json_field(string name, const char* value) {
	ostringstream os;
	os << "\"" << name << "\":\"" << value << "\"";
	return os.str();
}

class box {
	public:
		typedef array<double, dimensions> point;
		box(double size = 0, string name = string()) :
			m_size(size),
			m_dimension(0),
			m_name(name)
		{
			int c = rand() % 0xFFFFFF;
			ostringstream os;
			os << "#" << setw(6) << setfill('0') << hex << c;
			m_color = os.str();
		}
		
		// calculate the box sizes for the current tree
		void map(point new_extent, point new_origin) {
			m_extent = new_extent;
			m_origin = new_origin;
			remap();
		}

		// fix the child areas to match the parent
		void remap() {
			double start = m_origin[m_dimension];
			double ratio = m_extent[m_dimension] / m_size;
			for (size_t i = 0; i < m_children.size(); ++i) {
				box& b = m_children[i];
				
				// use the parent values for other dimensions
				b.m_origin = m_origin;
				b.m_extent = m_extent;

				b.m_origin[m_dimension] = start;
				double w = b.m_size * ratio;
				b.m_extent[m_dimension] = w;

				start += w;

				b.remap();
			}
		}

		// the size of the box and children should be kept up to date
		double size() {
			return m_size;
		}

		void add(box b) {
			b.adjust_dimension(1);
			m_children.push_back(b);
			m_size += b.m_size;
		}

		double origin() {
			return m_origin[m_dimension];
		}

		double extent() {
			return m_extent[m_dimension];
		}

		box& child(size_t index) {
			return m_children[index];
		}

		size_t children() {
			return m_children.size();
		}

		void adjust_dimension(int change = 1) {
			m_dimension = next_dimension(change);
			for (int i = 0; i < m_children.size(); ++i) {
				m_children[i].adjust_dimension(change);
			}
		}

		int next_dimension(int change = 1) const {
			return (m_dimension + change) % dimensions;
		}

		void clear() {
			m_children.clear();
			m_size = 0;
			m_origin = point();
			m_extent = point();
			m_dimension = 0;
			m_desired.clear();
		}
    
        void split(size_t index) {
			box b[2];
			size_t n = 0;
			for (int i = 0; i < children(); ++i) {
				if (i == index) {
					++n;
				}
				b[n].add(child(i));
			}
			clear();
			add(b[0]);
			add(b[1]);
        }
		
		void balance(bool top = false) {
			// get score for doing nothing
			double best_score = score();
			box best_box = *this;
			if (top) cerr << "initial score: " << best_score << endl;
			for (int r = 0; r < min(5ul,m_children.size()-1); ++r) {
				if (top) cerr << "Shuffle: " << r << endl;
				random_shuffle(m_children.begin(), m_children.end());
				
				remap();
				
				for (int p = 0; p < m_children.size()/3; ++p) {
					if (top) cerr << "Testing split: " << p << endl;

					if (m_children.size() < 3) {
						break;
					}
					int i = rand() % (m_children.size()-2) + 1;
				
					box b = *this;
					b.split(i);
					b.map(m_extent, m_origin);
					b.child(0).balance();
					b.child(1).balance();
					
					double s = b.score();
					if (top) cerr << "new score: " << s << endl;
					if (s < best_score) {
						best_score = s;
						best_box = b;
						if (top) best_box.write_svg("out.svg");
					}
				}
			}
			*this = best_box;
		}

		box subbox(size_t start, size_t end) const {
			box rval;
			for (size_t i = start; i < end; ++i) {
				rval.add(m_children[i]);
			}
			return rval;
		}

		void add_desired(point desired) {
			m_desired.push_back(desired);
		}

		point center()
		{
			point rval;
			for (int i = 0; i < dimensions; ++i) {
				rval[i] = m_origin[i] + m_extent[i]/2.0;
			}
			return rval;
		}
		
		double distance(point a, point b) {
			double sum = 0.0;
			for (int i = 0; i < dimensions; ++i) {
				double distance = a[i] - b[i];
				sum += distance*distance;
			}
			return sqrt(sum);
		}

		double score() {
			if (m_children.size() == 0) {				
				double dist = 100.0;
				for (int i = 0; i < m_desired.size(); ++i) {
					dist = min(dist, distance(center(), m_desired[0]));
				}

				double ratio;
				if (m_extent[0] > m_extent[1]) {
					ratio = m_extent[0] / m_extent[1];
				} else {
					ratio = m_extent[1] / m_extent[0];
				}

				return ratio + dist / 4;// / m_size;
			} else {
				double sum = 0.0;
				for (int i = 0; i < m_children.size(); ++i) {
					sum += m_children[i].score();
				}
				return sum;
			}
		}
		
		bool contains(point p) {
			for (int i = 0; i < dimensions; ++i) {
				if (p[i] < m_origin[i])
					return false;
				if (p[i] > m_origin[i]+m_extent[i])
					return false;
			}
			return true;
		}

		bool contains_desired() {
			if (m_children.size() == 0) {
				for (int i = 0; i < m_desired.size(); ++i) {
					if (contains(m_desired[i])) {
						return true;
					}
				}
				return false;
			}
			for (int i = 0; i < m_children.size(); ++i) {
				if (!m_children[i].contains_desired()) {
					return false;
				}
			}
			return true;
		}

		bool leaf() {
			return m_children.size() == 0;
		}
	
		string rect_svg(point offset = point()) {
			ostringstream os;
			if (m_children.size() == 0) {
				os << "  <rect "; {
					os << attr("x", m_origin[0]+offset[0]);
					os << attr("y", m_origin[1]+offset[1]);
					os << attr("width", m_extent[0]);
					os << attr("height", m_extent[1]);
					os << attr("fill", m_color);
					os << attr("stroke", "black");
				} os << "/>\n";
			} else {
				for (int i = 0; i < m_children.size(); ++i) {
					os << m_children[i].rect_svg(offset);
				}
			}
			return os.str();
		}

		string point_svg(point offset = point()) {
			ostringstream os;
			if (m_children.size() == 0 && m_desired.size() > 0) {
				for (int i = 0; i < m_desired.size(); ++i) {
					if (contains(m_desired[i])) {
						os << "  <circle ";
						os << attr("cx", m_desired[i][0]+offset[0]);
						os << attr("cy", m_desired[i][1]+offset[1]);
						os << attr("r", 4);
						os << attr("fill", m_color);
						os << attr("stroke", "black");
						os << "/>\n";
					}
					os << "  <line ";
					os << attr("x1", m_desired[i][0]+offset[0]);
					os << attr("y1", m_desired[i][1]+offset[1]);
					os << attr("x2", m_origin[0]+m_extent[0]/2+offset[0]);
					os << attr("y2", m_origin[1]+m_extent[1]/2+offset[1]);
					os << attr("stroke", "black");
					os << "/>";

					os << "  <circle ";
					os << attr("cx", m_origin[0]+m_extent[0]/2+offset[0]);
					os << attr("cy", m_origin[1]+m_extent[1]/2+offset[1]);
					os << attr("r", 5);
					os << attr("stroke", "black");
					os << "/>\n";
				}
			} else {
				for (int i = 0; i < m_children.size(); ++i) {
					os << m_children[i].point_svg(offset);
				}
			}
			return os.str();
		}

		string json(int level = 0) {
			ostringstream os;
			if (m_children.size() == 0 && m_name != string()) {
				for (int i = 0; i < level; ++i) {
					os << "  ";
				}
				os << "{ ";
				os << json_field("name", m_name) << ",";
				os << json_field("value", m_size) << " }";
			} else {
				for (int i = 0; i < level; ++i) {
					os << "  ";
				}
				os << "[\n";
				for (int i = 0; i < m_children.size(); ++i) {
					os << m_children[i].json(level+1);
					if (i < m_children.size()-1) {
						os << ",";
					}
					os << endl;
				}
				for (int i = 0; i < level; ++i) {
					os << "  ";
				}
				os << "]";
			}
			return os.str();
		}
		
		string flat_json() {
			ostringstream os;
			if (m_children.size() == 0 && m_name != string()) {
				os << "{ ";
				os << json_field("name", m_name) << ",";
				os << json_field("x", m_origin[0]) << ",";
				os << json_field("y", m_origin[1]) << ",";
				os << json_field("width", m_extent[0]) << ",";
				os << json_field("height", m_extent[1]) << ",";
				os << json_field("value", m_size) << " }";
			} else {
				for (int i = 0; i < m_children.size(); ++i) {
					os << m_children[i].flat_json();
					if (i < m_children.size()-1) {
						os << ",";
					}
					os << endl;
				}
			}
			return os.str();
		}

		void write_svg(string filename) {
			ofstream svg("out.svg");
			svg << "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
			svg << "<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" "
				"\"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">\n";
			svg << "<svg xmlns=\"http://www.w3.org/2000/svg\">\n";
			svg << rect_svg();
			svg << point_svg();
			svg << "</svg>\n";
		}

	private:
		vector<box> m_children;
		double m_size;
		point m_origin, m_extent;
		size_t m_dimension;
		string m_color;
		string m_name;
		
		vector<point> m_desired;
};

box all;

void add_box(int size, string name,
	int dx0, int dy0,
	int dx1, int dy1,
	int dx2, int dy2) {
	box b(size, name);
	box::point d;
	d[0] = dx0; d[1] = dy0; b.add_desired(d);
	d[0] = dx1; d[1] = dy1; b.add_desired(d);
	d[0] = dx2; d[1] = dy2; b.add_desired(d);
	all.add(b);
}

void add_box(int size, string name) {
	box b(size, name);
	all.add(b);
}

int main() {
	srand(10);

	box::point origin = {0,0}, extent = {1268,425};
	
	add_box(110, "mdtommyd", 332, 372, 891, 54, 1214, 392);
	add_box(35 , "lhealy");
	add_box(60 , "joshg");
	add_box(110, "tmerrill", 673, 83, 120, 115, 863, 394);
	add_box(60 , "mchackett");
	add_box(35 , "rchrastil", 1127, 38, 332, 350, 1229, 388);
	add_box(110, "hollyl");
	add_box(60 , "clarkh");
	add_box(60 , "jkelly");
	add_box(150, "chilton", 346, 345, 650, 220, 846, 364);
	add_box(35 , "aneubert");
	add_box(60 , "garyl");
	add_box(60 , "sean");
	add_box(510, "rsmith");
	add_box(260, "shawnN");
	add_box(60 , "dmoore", 306, 369, 1095, 32, 1006, 400);

	all.map(extent, origin);
	all.balance(true);
	all.map(extent, origin);

	ofstream json("out.json");
	json << all.json() << endl;

	ofstream flat("flat.json");
	flat << "[" << endl;
	flat << all.flat_json() << endl;
	flat << "]" << endl;

}